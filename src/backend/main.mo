import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



// always keep this line when you change the data structures or state


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type AgentId = Principal;
  type BuyerId = Principal;
  type PropertyImageId = Nat;

  type AgentProfile = {
    principal : Principal;
    licenseNumber : Text;
    agency : Text;
    bio : Text;
    rating : Float;
    verified : Bool;
    firstName : Text;
    lastName : Text;
    contactInfo : ContactInfo;
  };

  type BuyerProfile = {
    firstName : Text;
    lastName : Text;
    contactInfo : ContactInfo;
    principal : Principal;
  };

  type ContactInfo = {
    email : Text;
    phone : Text;
    address : Text;
    city : Text;
    country : Text;
  };

  public type UserProfile = {
    profileType : { #agent : AgentProfile; #buyer : BuyerProfile };
  };

  let agents = Map.empty<Principal, AgentProfile>();
  let buyers = Map.empty<Principal, BuyerProfile>();

  public type ExternalBlobId = Text;

  type Property = {
    id : Nat;
    title : Text;
    description : Text;
    propertyType : PropertyType;
    price : Float;
    currency : Text;
    address : Text;
    city : Text;
    country : Text;
    bedrooms : Nat;
    bathrooms : Nat;
    area : Float;
    status : PropertyStatus;
    features : [Text];
    agentId : AgentId;
    createdAt : Int;
    updatedAt : Int;
    images : [Storage.ExternalBlob];
    featured : Bool;
  };

  module Property {
    public func compare(property1 : Property, property2 : Property) : Order.Order {
      Text.compare(property1.title, property2.title);
    };
  };

  type PropertyType = {
    #house;
    #apartment;
    #land;
    #commercial;
  };

  type PropertyStatus = {
    #available;
    #sold;
    #draft;
  };

  type InquiryStatus = {
    #pending;
    #responded;
    #closed;
  };

  let properties = Map.empty<Nat, Property>();
  let publishedProperties = Map.empty<Nat, Property>();

  // Stored inquiry type
  public type Inquiry = {
    id : Nat;
    propertyId : Nat;
    buyerId : BuyerId;
    message : Text;
    status : InquiryStatus;
    response : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  // Return type with computed propertyTitle
  public type InquiryWithTitle = {
    id : Nat;
    propertyId : Nat;
    propertyTitle : Text;
    buyerId : BuyerId;
    message : Text;
    status : InquiryStatus;
    response : ?Text;
    createdAt : Int;
    updatedAt : Int;
  };

  let inquiries = Map.empty<Nat, Inquiry>();

  type FilterCriteria = {
    city : ?Text;
    minPrice : ?Float;
    maxPrice : ?Float;
    minBedrooms : ?Nat;
    maxBedrooms : ?Nat;
    propertyType : ?PropertyType;
    status : ?PropertyStatus;
  };

  let favoriteProperties = Map.empty<BuyerId, Set.Set<Nat>>();

  var propertyIdCounter = 0;
  var inquiryIdCounter = 0;

  // Support Tickets

  public type TicketPriority = { #low; #medium; #high; #urgent };
  public type TicketStatus = { #open; #inProgress; #resolved };

  public type TicketMessage = {
    senderPrincipal : Principal;
    senderLabel : Text;
    text : Text;
    createdAt : Int;
  };

  public type Ticket = {
    id : Nat;
    requesterPrincipal : Principal;
    requesterEmail : Text;
    subject : Text;
    priority : TicketPriority;
    status : TicketStatus;
    messages : [TicketMessage];
    createdAt : Int;
    updatedAt : Int;
  };

  let tickets = Map.empty<Nat, Ticket>();
  var ticketIdCounter = 0;

  // Transactions

  public type Transaction = {
    id : Text;
    propertyId : Nat;
    propertyTitle : Text;
    buyerId : Text;
    buyerName : Text;
    sellerId : Text;
    sellerName : Text;
    amount : Float;
    currency : Text;
    status : TransactionStatus;
    createdAt : Int;
    updatedAt : Int;
  };

  public type TransactionStatus = {
    #pending;
    #completed;
    #failed;
    #cancelled;
  };

  let transactions = Map.empty<Text, Transaction>();

  // Transactions

  public query ({ caller }) func getTransactionsForBuyer(buyerId : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view buyer transactions");
    };

    // Verify caller is the buyer or an admin
    let callerText = caller.toText();
    if (callerText != buyerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };

    let result = List.empty<Transaction>();

    for ((_, trans) in transactions.entries()) {
      if (trans.buyerId == buyerId) {
        result.add(trans);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getTransactionsForSeller(sellerId : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view seller transactions");
    };

    // Verify caller is the seller or an admin
    let callerText = caller.toText();
    if (callerText != sellerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };

    let result = List.empty<Transaction>();

    for ((_, trans) in transactions.entries()) {
      if (trans.sellerId == sellerId) {
        result.add(trans);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };

    let result = List.empty<Transaction>();

    for ((_, trans) in transactions.entries()) {
      result.add(trans);
    };
    result.toArray();
  };

  public shared ({ caller }) func updateTransactionStatus(id : Text, status : TransactionStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update transaction status");
    };

    switch (transactions.get(id)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?trans) {
        let updatedTransaction : Transaction = {
          trans with
          status;
          updatedAt = Time.now();
        };
        transactions.add(id, updatedTransaction);
      };
    };
  };

  // Required user profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (agents.get(caller)) {
      case (?agentProfile) {
        ?{ profileType = #agent(agentProfile) };
      };
      case (null) {
        switch (buyers.get(caller)) {
          case (?buyerProfile) {
            ?{ profileType = #buyer(buyerProfile) };
          };
          case (null) { null };
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (agents.get(user)) {
      case (?agentProfile) {
        ?{ profileType = #agent(agentProfile) };
      };
      case (null) {
        switch (buyers.get(user)) {
          case (?buyerProfile) {
            ?{ profileType = #buyer(buyerProfile) };
          };
          case (null) { null };
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (profile.profileType) {
      case (#agent(agentProfile)) {
        let newProfile : AgentProfile = {
          agentProfile with
          principal = caller;
        };
        agents.add(caller, newProfile);
      };
      case (#buyer(buyerProfile)) {
        let newProfile : BuyerProfile = {
          buyerProfile with
          principal = caller;
        };
        buyers.add(caller, newProfile);
      };
    };
  };

  public shared ({ caller }) func createAgentProfile(profile : AgentProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    let newProfile : AgentProfile = {
      profile with
      verified = false;
      principal = caller;
    };

    agents.add(caller, newProfile);
  };

  public shared ({ caller }) func createBuyerProfile(profile : BuyerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    let newProfile : BuyerProfile = {
      profile with
      principal = caller;
    };

    buyers.add(caller, newProfile);
  };

  public query ({ caller }) func getAgentProfile(agentPrincipal : Principal) : async ?AgentProfile {
    agents.get(agentPrincipal);
  };

  public query ({ caller }) func getAgentsForVerification() : async [AgentProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view agent verifications");
    };
    let result = List.empty<AgentProfile>();
    for ((_, agent) in agents.entries()) {
      result.add(agent);
    };
    result.toArray();
  };

  public query ({ caller }) func getAgentProperties(agentId : AgentId) : async [Property] {
    let agentProperties = List.empty<Property>();
    for ((_, property) in properties.entries()) {
      if (property.agentId == agentId) {
        agentProperties.add(property);
      };
    };
    agentProperties.toArray();
  };

  public shared ({ caller }) func createProperty(property : Property) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create properties");
    };

    if (not (agents.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only agents can create properties");
    };

    let newProperty : Property = {
      property with
      id = propertyIdCounter;
      agentId = caller;
      createdAt = Time.now();
      updatedAt = Time.now();
      status = #draft;
      featured = false;
    };

    properties.add(propertyIdCounter, newProperty);
    let propertyId = propertyIdCounter;
    propertyIdCounter += 1;
    propertyId;
  };

  public query ({ caller }) func getProperty(propertyId : Nat) : async ?Property {
    properties.get(propertyId);
  };

  public query ({ caller }) func getPublishedProperty(propertyId : Nat) : async ?Property {
    publishedProperties.get(propertyId);
  };

  public query ({ caller }) func getAllProperties() : async [Property] {
    let iter = properties.values();
    iter.toArray();
  };

  public query ({ caller }) func getAllPublishedProperties() : async [Property] {
    let iter = publishedProperties.values();
    iter.toArray();
  };

  public query ({ caller }) func searchProperties(searchText : Text) : async [Property] {
    let searchTextLower = searchText.map(func(c) { if (c >= 'A' and c <= 'Z') { Char.fromNat32(Char.toNat32(c) + 32) } else { c } });
    let results = List.empty<Property>();

    for ((_, property) in publishedProperties.entries()) {
      let titleLower = property.title.map(func(c) { if (c >= 'A' and c <= 'Z') { Char.fromNat32(Char.toNat32(c) + 32) } else { c } });
      let descriptionLower = property.description.map(func(c) { if (c >= 'A' and c <= 'Z') { Char.fromNat32(Char.toNat32(c) + 32) } else { c } });

      if (titleLower.contains(#text searchTextLower) or descriptionLower.contains(#text searchTextLower)) {
        results.add(property);
      };
    };
    results.toArray();
  };

  public query ({ caller }) func getAllPropertyImages() : async [Storage.ExternalBlob] {
    var allImages : [Storage.ExternalBlob] = [];
    for ((_, property) in properties.entries()) {
      for (image in property.images.values()) {
        allImages := allImages.concat([image]);
      };
    };
    allImages;
  };

  public shared ({ caller }) func updateProperty(propertyId : Nat, updatedProperty : Property) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update properties");
    };

    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property not found") };
      case (?property) {
        if (property.agentId != caller) {
          Runtime.trap("Unauthorized: Only property owners can update");
        };

        let newProperty : Property = {
          property with
          title = updatedProperty.title;
          description = updatedProperty.description;
          propertyType = updatedProperty.propertyType;
          price = updatedProperty.price;
          currency = updatedProperty.currency;
          address = updatedProperty.address;
          city = updatedProperty.city;
          country = updatedProperty.country;
          bedrooms = updatedProperty.bedrooms;
          bathrooms = updatedProperty.bathrooms;
          area = updatedProperty.area;
          features = updatedProperty.features;
          updatedAt = Time.now();
        };
        properties.add(propertyId, newProperty);
      };
    };
  };

  public shared ({ caller }) func deleteProperty(propertyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete properties");
    };

    if (not (agents.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only agents can delete properties");
    };

    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property not found") };
      case (?property) {
        if (property.agentId != caller) {
          Runtime.trap("Unauthorized: Only property owners can delete");
        };
        properties.remove(propertyId);
      };
    };
  };

  public query ({ caller }) func getBuyerProfile(buyerId : BuyerId) : async ?BuyerProfile {
    buyers.get(buyerId);
  };

  public shared ({ caller }) func inquireProperty(propertyId : Nat, message : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can inquire about properties");
    };

    if (not (buyers.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only buyers can inquire about properties");
    };

    let inquiry : Inquiry = {
      id = inquiryIdCounter;
      propertyId;
      buyerId = caller;
      message;
      status = #pending;
      response = null;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    inquiries.add(inquiryIdCounter, inquiry);
    let inquiryId = inquiryIdCounter;
    inquiryIdCounter += 1;
    inquiryId;
  };

  public shared ({ caller }) func respondToInquiry(inquiryId : Nat, response : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can respond to inquiries");
    };

    if (not (agents.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only agents can respond to inquiries");
    };

    switch (inquiries.get(inquiryId)) {
      case (null) { Runtime.trap("Inquiry not found") };
      case (?inquiry) {
        let agentOwns = switch (properties.get(inquiry.propertyId)) {
          case (?property) { property.agentId == caller };
          case (null) {
            switch (publishedProperties.get(inquiry.propertyId)) {
              case (?property) { property.agentId == caller };
              case (null) { false };
            };
          };
        };

        if (not agentOwns) {
          Runtime.trap("Unauthorized: Only the property owner can respond to inquiries");
        };

        let updatedInquiry : Inquiry = {
          inquiry with
          response = ?response;
          status = #responded;
          updatedAt = Time.now();
        };
        inquiries.add(inquiryId, updatedInquiry);
      };
    };
  };

  public query ({ caller }) func getAgentInquiries() : async [InquiryWithTitle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inquiries");
    };

    if (not (agents.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only agents can view agent inquiries");
    };

    let result = List.empty<InquiryWithTitle>();

    for ((_, inquiry) in inquiries.entries()) {
      let propertyOpt = switch (properties.get(inquiry.propertyId)) {
        case (?p) { ?p };
        case (null) { publishedProperties.get(inquiry.propertyId) };
      };

      switch (propertyOpt) {
        case (null) {};
        case (?property) {
          if (property.agentId == caller) {
            let withTitle : InquiryWithTitle = {
              id = inquiry.id;
              propertyId = inquiry.propertyId;
              propertyTitle = property.title;
              buyerId = inquiry.buyerId;
              message = inquiry.message;
              status = inquiry.status;
              response = inquiry.response;
              createdAt = inquiry.createdAt;
              updatedAt = inquiry.updatedAt;
            };
            result.add(withTitle);
          };
        };
      };
    };

    result.toArray();
  };

  public query ({ caller }) func getBuyerInquiries() : async [InquiryWithTitle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inquiries");
    };

    if (not (buyers.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only buyers can view buyer inquiries");
    };

    let result = List.empty<InquiryWithTitle>();

    for ((_, inquiry) in inquiries.entries()) {
      if (inquiry.buyerId == caller) {
        let propertyOpt = switch (publishedProperties.get(inquiry.propertyId)) {
          case (?p) { ?p };
          case (null) { properties.get(inquiry.propertyId) };
        };

        let title = switch (propertyOpt) {
          case (?property) { property.title };
          case (null) { "Unknown Property" };
        };

        let withTitle : InquiryWithTitle = {
          id = inquiry.id;
          propertyId = inquiry.propertyId;
          propertyTitle = title;
          buyerId = inquiry.buyerId;
          message = inquiry.message;
          status = inquiry.status;
          response = inquiry.response;
          createdAt = inquiry.createdAt;
          updatedAt = inquiry.updatedAt;
        };
        result.add(withTitle);
      };
    };

    result.toArray();
  };

  public query ({ caller }) func getPropertyDetails(propertyId : Nat) : async Property {
    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property not found") };
      case (?property) {
        if (property.status == #draft) {
          if (caller != property.agentId and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Cannot view draft properties");
          };
        };
        property;
      };
    };
  };

  public query ({ caller }) func getPublishedPropertyDetails(propertyId : Nat) : async Property {
    switch (publishedProperties.get(propertyId)) {
      case (null) { Runtime.trap("Property not found") };
      case (?property) { property };
    };
  };

  public query ({ caller }) func filterPublishedProperties(criteria : FilterCriteria) : async [Property] {
    let filteredProperties = List.empty<Property>();

    for ((_, property) in publishedProperties.entries()) {
      var matches = true;
      switch (criteria.city) {
        case (null) {};
        case (?city) { matches := matches and Text.equal(property.city, city) };
      };
      switch (criteria.minPrice) {
        case (null) {};
        case (?minPrice) { matches := matches and property.price >= minPrice };
      };
      switch (criteria.maxPrice) {
        case (null) {};
        case (?maxPrice) { matches := matches and property.price <= maxPrice };
      };
      switch (criteria.minBedrooms) {
        case (null) {};
        case (?minBedrooms) { matches := matches and property.bedrooms >= minBedrooms };
      };
      switch (criteria.maxBedrooms) {
        case (null) {};
        case (?maxBedrooms) { matches := matches and property.bedrooms <= maxBedrooms };
      };
      switch (criteria.propertyType) {
        case (null) {};
        case (?propertyType) { matches := matches and property.propertyType == propertyType };
      };
      switch (criteria.status) {
        case (null) {};
        case (?status) { matches := matches and property.status == status };
      };

      if (matches) {
        filteredProperties.add(property);
      };
    };

    filteredProperties.toArray();
  };

  public shared ({ caller }) func addPropertyToFavorites(buyerId : BuyerId, propertyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage favorites");
    };

    if (buyerId != caller) {
      Runtime.trap("Unauthorized: You can only add favorites to your own account");
    };

    if (not buyers.containsKey(buyerId)) {
      Runtime.trap("Unauthorized: Only buyers can add favorites");
    };

    let currentFavorites = switch (favoriteProperties.get(buyerId)) {
      case (null) { Set.empty<Nat>() };
      case (?favorites) { favorites };
    };
    currentFavorites.add(propertyId);
    favoriteProperties.add(buyerId, currentFavorites);
  };

  public shared ({ caller }) func removePropertyFromFavorites(buyerId : BuyerId, propertyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage favorites");
    };

    if (buyerId != caller) {
      Runtime.trap("Unauthorized: You can only remove favorites from your own account");
    };

    if (not buyers.containsKey(buyerId)) {
      Runtime.trap("Unauthorized: Only buyers can remove favorites");
    };

    let currentFavorites = switch (favoriteProperties.get(buyerId)) {
      case (null) { Set.empty<Nat>() };
      case (?favorites) { favorites };
    };

    currentFavorites.remove(propertyId);

    if (currentFavorites.isEmpty()) {
      favoriteProperties.remove(buyerId);
    } else {
      favoriteProperties.add(buyerId, currentFavorites);
    };
  };

  public query ({ caller }) func getFavoriteProperties(buyerId : BuyerId) : async [Property] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view favorites");
    };

    if (buyerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own favorites");
    };

    if (not buyers.containsKey(buyerId)) {
      Runtime.trap("Unauthorized: Only buyers have favorites");
    };

    switch (favoriteProperties.get(buyerId)) {
      case (null) { [] };
      case (?favorites) {
        favorites.toArray().map(func(propertyId) { properties.get(propertyId) }).filter(func(option) { option != null }).map(func(option) { switch (option) { case (?property) { property }; case (null) { Runtime.trap("This should never happen") } } });
      };
    };
  };

  public shared ({ caller }) func publishProperty(propertyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can publish properties");
    };

    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property not found") };
      case (?property) {
        if (property.agentId != caller) {
          Runtime.trap("Unauthorized: Only property owners can publish");
        };

        if (not (agents.containsKey(caller))) {
          Runtime.trap("Unauthorized: Only agents can publish properties");
        };

        let updatedProperty : Property = {
          property with
          status = #available;
          updatedAt = Time.now();
        };
        properties.add(propertyId, updatedProperty);
        publishedProperties.add(propertyId, updatedProperty);
      };
    };
  };

  public shared ({ caller }) func promoteProperty(propertyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can promote properties");
    };

    if (not (agents.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only agents can promote properties");
    };

    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property not found") };
      case (?property) {
        if (property.agentId != caller) {
          Runtime.trap("Unauthorized: Only property owners can promote");
        };

        let newProperty : Property = {
          property with
          featured = not property.featured;
          updatedAt = Time.now();
        };
        properties.add(propertyId, newProperty);

        if (property.status == #available) {
          publishedProperties.add(propertyId, newProperty);
        };
      };
    };
  };

  public query ({ caller }) func getFeaturedProperties() : async [Property] {
    publishedProperties.values().filter(func(p) { p.featured }).toArray();
  };

  public shared ({ caller }) func verifyAgent(agentId : AgentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify agents");
    };

    switch (agents.get(agentId)) {
      case (null) { Runtime.trap("Agent not found") };
      case (?agentProfile) {
        let updatedAgent : AgentProfile = {
          agentProfile with
          verified = true;
        };
        agents.add(agentId, updatedAgent);
      };
    };
  };

  public shared ({ caller }) func uploadPropertyImage(propertyId : Nat, blobId : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload images");
    };

    switch (properties.get(propertyId)) {
      case (null) { Runtime.trap("Property not found") };
      case (?property) {
        if (property.agentId != caller) {
          Runtime.trap("Unauthorized: Only property owners can upload images");
        };

        if (not (agents.containsKey(caller))) {
          Runtime.trap("Unauthorized: Only agents can upload property images");
        };

        let updatedProperty : Property = {
          property with
          images = property.images.concat([blobId]);
          updatedAt = Time.now();
        };
        properties.add(propertyId, updatedProperty);
      };
    };
  };

  public query ({ caller }) func getAnalytics() : async {
    userCount : Nat;
    agentCount : Nat;
    buyerCount : Nat;
    propertyCount : Nat;
    inquiryCount : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    {
      userCount = agents.size() + buyers.size();
      agentCount = agents.size();
      buyerCount = buyers.size();
      propertyCount = properties.size();
      inquiryCount = inquiries.size();
    };
  };

  // Support Ticket Functions

  public shared ({ caller }) func createSupportTicket(subject : Text, message : Text, email : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create support tickets");
    };

    let firstMsg : TicketMessage = {
      senderPrincipal = caller;
      senderLabel = email;
      text = message;
      createdAt = Time.now();
    };

    let ticket : Ticket = {
      id = ticketIdCounter;
      requesterPrincipal = caller;
      requesterEmail = email;
      subject;
      priority = #medium;
      status = #open;
      messages = [firstMsg];
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    tickets.add(ticketIdCounter, ticket);
    let ticketId = ticketIdCounter;
    ticketIdCounter += 1;
    ticketId;
  };

  public query ({ caller }) func getAllSupportTickets() : async [Ticket] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all support tickets");
    };
    let result = List.empty<Ticket>();
    for ((_, ticket) in tickets.entries()) {
      result.add(ticket);
    };
    result.toArray();
  };

  public shared ({ caller }) func respondToTicket(ticketId : Nat, reply : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can respond to tickets");
    };

    switch (tickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let replyMsg : TicketMessage = {
          senderPrincipal = caller;
          senderLabel = "Admin";
          text = reply;
          createdAt = Time.now();
        };
        let newStatus : TicketStatus = switch (ticket.status) {
          case (#open) { #inProgress };
          case (other) { other };
        };
        let updatedTicket : Ticket = {
          ticket with
          messages = ticket.messages.concat([replyMsg]);
          status = newStatus;
          updatedAt = Time.now();
        };
        tickets.add(ticketId, updatedTicket);
      };
    };
  };

  public shared ({ caller }) func updateTicketStatus(ticketId : Nat, status : TicketStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update ticket status");
    };

    switch (tickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let updatedTicket : Ticket = {
          ticket with
          status;
          updatedAt = Time.now();
        };
        tickets.add(ticketId, updatedTicket);
      };
    };
  };

  public shared ({ caller }) func updateTicketPriority(ticketId : Nat, priority : TicketPriority) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update ticket priority");
    };

    switch (tickets.get(ticketId)) {
      case (null) { Runtime.trap("Ticket not found") };
      case (?ticket) {
        let updatedTicket : Ticket = {
          ticket with
          priority;
          updatedAt = Time.now();
        };
        tickets.add(ticketId, updatedTicket);
      };
    };
  };

  // PROPERTY REVIEWS

  module PrincipalNatPair {
    public func compare(lhs : (Principal, Nat), rhs : (Principal, Nat)) : Order.Order {
      switch (Principal.compare(lhs.0, rhs.0)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) { Nat.compare(lhs.1, rhs.1) };
      };
    };
  };

  public type Review = {
    id : Nat;
    propertyId : Nat;
    buyerId : Principal;
    buyerName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  var reviewIdCounter = 0;
  let propertyReviews = Map.empty<Nat, List.List<Review>>();
  let reviewByBuyerAndProperty = Map.empty<(Principal, Nat), Review>();

  public shared ({ caller }) func submitReview(propertyId : Nat, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit reviews");
    };

    if (not (buyers.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only buyers can submit reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (reviewByBuyerAndProperty.get((caller, propertyId))) {
      case (?_existing) { Runtime.trap("You have already submitted a review for this property") };
      case (null) {};
    };

    let buyerName = switch (buyers.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please create your profile first") };
      case (?buyer) { buyer.firstName # " " # buyer.lastName };
    };

    let review : Review = {
      id = reviewIdCounter;
      propertyId;
      buyerId = caller;
      buyerName;
      rating;
      comment;
      createdAt = Time.now();
    };

    let reviews = switch (propertyReviews.get(propertyId)) {
      case (null) {
        let newList = List.empty<Review>();
        newList.add(review);
        newList;
      };
      case (?reviews) {
        reviews.add(review);
        reviews;
      };
    };
    propertyReviews.add(propertyId, reviews);

    reviewByBuyerAndProperty.add((caller, propertyId), review);

    reviewIdCounter += 1;
  };

  public query ({ caller }) func getPropertyReviews(propertyId : Nat) : async [Review] {
    switch (propertyReviews.get(propertyId)) {
      case (?reviews) {
        reviews.toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getPropertyAverageRating(propertyId : Nat) : async Float {
    switch (propertyReviews.get(propertyId)) {
      case (null) { 0.0 };
      case (?reviews) {
        let numReviews = reviews.size();
        if (numReviews == 0) { return 0.0 };
        var total : Nat = 0;
        for (review in reviews.values()) {
          total += review.rating;
        };
        total.toFloat() / numReviews.toFloat();
      };
    };
  };

  public query ({ caller }) func hasSubmittedReview(propertyId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check review status");
    };

    reviewByBuyerAndProperty.get((caller, propertyId)) != null;
  };

  // AGENT REVIEW SYSTEM

  module PrincipalPrincipalPair {
    public func compare(lhs : (Principal, Principal), rhs : (Principal, Principal)) : Order.Order {
      switch (Principal.compare(lhs.0, rhs.0)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) { Principal.compare(lhs.1, rhs.1) };
      };
    };
  };

  public type AgentReview = {
    id : Nat;
    agentId : Principal;
    buyerId : Principal;
    buyerName : Text;
    transactionId : Text;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  var agentReviewIdCounter = 0;
  let agentReviews = Map.empty<Principal, List.List<AgentReview>>();
  let reviewByBuyerAndAgent = Map.empty<(Principal, Principal), AgentReview>();

  public shared ({ caller }) func submitAgentReview(agentId : Principal, transactionId : Text, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit agent reviews");
    };

    if (not (buyers.containsKey(caller))) {
      Runtime.trap("Unauthorized: Only buyers can submit agent reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (reviewByBuyerAndAgent.get((caller, agentId))) {
      case (?_existing) { Runtime.trap("You have already submitted a review for this agent") };
      case (null) {};
    };

    // Verify the transaction exists and involves the caller as buyer and the specified agent
    switch (transactions.get(transactionId)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) {
        let callerText = caller.toText();
        if (transaction.buyerId != callerText) {
          Runtime.trap("Unauthorized: You are not the buyer in this transaction");
        };

        // Verify the agent is the seller in the transaction
        let agentText = agentId.toText();
        if (transaction.sellerId != agentText) {
          Runtime.trap("Unauthorized: The specified agent is not the seller in this transaction");
        };
      };
    };

    let buyerName = switch (buyers.get(caller)) {
      case (null) { Runtime.trap("Profile not found. Please create your profile first") };
      case (?buyer) { buyer.firstName # " " # buyer.lastName };
    };

    let review : AgentReview = {
      id = agentReviewIdCounter;
      agentId;
      buyerId = caller;
      buyerName;
      transactionId;
      rating;
      comment;
      createdAt = Time.now();
    };

    let reviews = switch (agentReviews.get(agentId)) {
      case (null) {
        let newList = List.empty<AgentReview>();
        newList.add(review);
        newList;
      };
      case (?reviews) {
        reviews.add(review);
        reviews;
      };
    };
    agentReviews.add(agentId, reviews);

    reviewByBuyerAndAgent.add((caller, agentId), review);

    agentReviewIdCounter += 1;
    updateAgentProfileRating(agentId);
  };

  public query ({ caller }) func getAgentReviews(agentId : Principal) : async [AgentReview] {
    switch (agentReviews.get(agentId)) {
      case (?reviews) {
        reviews.toArray();
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAgentAverageRating(agentId : Principal) : async Float {
    switch (agentReviews.get(agentId)) {
      case (null) { 0.0 };
      case (?reviews) {
        let numReviews = reviews.size();
        if (numReviews == 0) { return 0.0 };
        var total : Nat = 0;
        for (review in reviews.values()) {
          total += review.rating;
        };
        total.toFloat() / numReviews.toFloat();
      };
    };
  };

  public query ({ caller }) func hasSubmittedAgentReview(agentId : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check agent review status");
    };

    reviewByBuyerAndAgent.get((caller, agentId)) != null;
  };

  func updateAgentProfileRating(agentId : Principal) {
    switch (agentReviews.get(agentId)) {
      case (?reviews) {
        let numReviews = reviews.size();
        if (numReviews == 0) { return };
        var total : Nat = 0;
        for (review in reviews.values()) {
          total += review.rating;
        };
        let newRating = total.toFloat() / numReviews.toFloat();

        switch (agents.get(agentId)) {
          case (?agentProfile) {
            let updatedAgent : AgentProfile = {
              agentProfile with
              rating = newRating;
            };
            agents.add(agentId, updatedAgent);
          };
          case (null) {};
        };
      };
      case (null) {};
    };
  };

  // ID DOCUMENT SUBMISSIONS

  public type IdDocStatus = { #pending; #approved; #rejected };

  public type IdDocumentSubmission = {
    id : Nat;
    submitterPrincipal : Principal;
    firstName : Text;
    lastName : Text;
    email : Text;
    docType : Text;
    frontBlob : Storage.ExternalBlob;
    backBlob : ?Storage.ExternalBlob;
    status : IdDocStatus;
    submittedAt : Int;
  };

  let idSubmissions = Map.empty<Nat, IdDocumentSubmission>();
  var idSubmissionIdCounter = 0;

  public shared ({ caller }) func submitIdDocument(
    firstName : Text,
    lastName : Text,
    email : Text,
    docType : Text,
    frontBlob : Storage.ExternalBlob,
    backBlob : ?Storage.ExternalBlob,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit ID documents");
    };

    let submission : IdDocumentSubmission = {
      id = idSubmissionIdCounter;
      submitterPrincipal = caller;
      firstName;
      lastName;
      email;
      docType;
      frontBlob;
      backBlob;
      status = #pending;
      submittedAt = Time.now();
    };

    idSubmissions.add(idSubmissionIdCounter, submission);
    let submissionId = idSubmissionIdCounter;
    idSubmissionIdCounter += 1;
    submissionId;
  };

  public query ({ caller }) func getIdDocumentSubmissions() : async [IdDocumentSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view ID document submissions");
    };
    let result = List.empty<IdDocumentSubmission>();
    for ((_, sub) in idSubmissions.entries()) {
      result.add(sub);
    };
    result.toArray();
  };

  public shared ({ caller }) func approveIdDocument(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve ID documents");
    };
    switch (idSubmissions.get(id)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?sub) {
        idSubmissions.add(id, { sub with status = #approved });
      };
    };
  };

  public shared ({ caller }) func rejectIdDocument(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject ID documents");
    };
    switch (idSubmissions.get(id)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?sub) {
        idSubmissions.add(id, { sub with status = #rejected });
      };
    };
  };
  // PUBLIC MARKET STATS (no auth required)

  public query func getPublicMarketStats() : async {
    totalListings : Nat;
    totalAgents : Nat;
    totalBuyers : Nat;
  } {
    {
      totalListings = properties.size();
      totalAgents = agents.size();
      totalBuyers = buyers.size();
    };
  };

  // NEWS & MARKET UPDATES

  public type NewsPost = {
    id : Nat;
    title : Text;
    summary : Text;
    content : Text;
    category : Text;
    author : Text;
    imageUrl : Text;
    publishedAt : Int;
    featured : Bool;
  };

  let newsPosts = Map.empty<Nat, NewsPost>();
  var newsPostIdCounter = 0;

  public shared ({ caller }) func createNewsPost(
    title : Text,
    summary : Text,
    content : Text,
    category : Text,
    author : Text,
    imageUrl : Text,
    featured : Bool,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create news posts");
    };
    let post : NewsPost = {
      id = newsPostIdCounter;
      title;
      summary;
      content;
      category;
      author;
      imageUrl;
      publishedAt = Time.now();
      featured;
    };
    newsPosts.add(newsPostIdCounter, post);
    let postId = newsPostIdCounter;
    newsPostIdCounter += 1;
    postId;
  };

  public query func getAllNewsPosts() : async [NewsPost] {
    let result = List.empty<NewsPost>();
    for ((_, post) in newsPosts.entries()) {
      result.add(post);
    };
    result.toArray();
  };

  public query func getFeaturedNewsPosts() : async [NewsPost] {
    let result = List.empty<NewsPost>();
    for ((_, post) in newsPosts.entries()) {
      if (post.featured) {
        result.add(post);
      };
    };
    result.toArray();
  };



  public shared ({ caller }) func updateNewsPost(
    id : Nat,
    title : Text,
    summary : Text,
    content : Text,
    category : Text,
    author : Text,
    imageUrl : Text,
    featured : Bool,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (newsPosts.get(id)) {
      case null { false };
      case (?existing) {
        let updated : NewsPost = {
          id = existing.id;
          title;
          summary;
          content;
          category;
          author;
          imageUrl;
          publishedAt = existing.publishedAt;
          featured;
        };
        newsPosts.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteNewsPost(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (newsPosts.get(id)) {
      case null { false };
      case _ {
        ignore newsPosts.remove(id);
        true;
      };
    };
  };


  // SELLER LISTING SUBMISSIONS

  public type SellerSubmissionStatus = { #pending; #approved; #rejected };

  public type SellerSubmission = {
    id : Nat;
    sellerPrincipal : Principal;
    sellerName : Text;
    sellerEmail : Text;
    title : Text;
    description : Text;
    propertyType : Text;
    price : Float;
    currency : Text;
    location : Text;
    country : Text;
    bedrooms : Nat;
    bathrooms : Nat;
    area : Float;
    imageUrls : [Text];
    status : SellerSubmissionStatus;
    submittedAt : Int;
    adminNote : Text;
  };

  let sellerSubmissions = Map.empty<Nat, SellerSubmission>();
  var sellerSubmissionIdCounter = 0;

  public shared ({ caller }) func submitSellerListing(
    sellerName : Text,
    sellerEmail : Text,
    title : Text,
    description : Text,
    propertyType : Text,
    price : Float,
    currency : Text,
    location : Text,
    country : Text,
    bedrooms : Nat,
    bathrooms : Nat,
    area : Float,
    imageUrls : [Text],
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit listings");
    };

    let submission : SellerSubmission = {
      id = sellerSubmissionIdCounter;
      sellerPrincipal = caller;
      sellerName;
      sellerEmail;
      title;
      description;
      propertyType;
      price;
      currency;
      location;
      country;
      bedrooms;
      bathrooms;
      area;
      imageUrls;
      status = #pending;
      submittedAt = Time.now();
      adminNote = "";
    };

    sellerSubmissions.add(sellerSubmissionIdCounter, submission);
    let submissionId = sellerSubmissionIdCounter;
    sellerSubmissionIdCounter += 1;
    submissionId;
  };

  public query ({ caller }) func getSellerSubmissions() : async [SellerSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all seller submissions");
    };
    let result = List.empty<SellerSubmission>();
    for ((_, sub) in sellerSubmissions.entries()) {
      result.add(sub);
    };
    result.toArray();
  };

  public query ({ caller }) func getMySellerSubmissions() : async [SellerSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their submissions");
    };
    let result = List.empty<SellerSubmission>();
    for ((_, sub) in sellerSubmissions.entries()) {
      if (sub.sellerPrincipal == caller) {
        result.add(sub);
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func approveSellerSubmission(id : Nat, adminNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve seller submissions");
    };
    switch (sellerSubmissions.get(id)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?sub) {
        sellerSubmissions.add(id, { sub with status = #approved; adminNote });
      };
    };
  };

  public shared ({ caller }) func rejectSellerSubmission(id : Nat, adminNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject seller submissions");
    };
    switch (sellerSubmissions.get(id)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?sub) {
        sellerSubmissions.add(id, { sub with status = #rejected; adminNote });
      };
    };
  };

};

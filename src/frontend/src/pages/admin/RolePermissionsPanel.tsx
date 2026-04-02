import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ROLES = ["Buyer", "Agent", "Moderator", "Admin"] as const;
type Role = (typeof ROLES)[number];

const PERMISSIONS = [
  "Create Listing",
  "Edit Listing",
  "Approve Listing",
  "Reject Listing",
  "Manage Users",
  "View Analytics",
  "Export Data",
  "Access Admin Panel",
  "Manage Currencies",
  "Moderate Content",
] as const;
type Permission = (typeof PERMISSIONS)[number];

const DEFAULT_MATRIX: Record<Permission, Record<Role, boolean>> = {
  "Create Listing": {
    Buyer: false,
    Agent: true,
    Moderator: false,
    Admin: true,
  },
  "Edit Listing": { Buyer: false, Agent: true, Moderator: true, Admin: true },
  "Approve Listing": {
    Buyer: false,
    Agent: false,
    Moderator: true,
    Admin: true,
  },
  "Reject Listing": {
    Buyer: false,
    Agent: false,
    Moderator: true,
    Admin: true,
  },
  "Manage Users": { Buyer: false, Agent: false, Moderator: false, Admin: true },
  "View Analytics": { Buyer: false, Agent: true, Moderator: true, Admin: true },
  "Export Data": { Buyer: false, Agent: false, Moderator: true, Admin: true },
  "Access Admin Panel": {
    Buyer: false,
    Agent: false,
    Moderator: true,
    Admin: true,
  },
  "Manage Currencies": {
    Buyer: false,
    Agent: false,
    Moderator: false,
    Admin: true,
  },
  "Moderate Content": {
    Buyer: false,
    Agent: false,
    Moderator: true,
    Admin: true,
  },
};

export default function RolePermissionsPanel() {
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);

  function toggle(permission: Permission, role: Role) {
    // Admin always keeps Access Admin Panel
    if (permission === "Access Admin Panel" && role === "Admin") return;
    setMatrix((prev) => ({
      ...prev,
      [permission]: { ...prev[permission], [role]: !prev[permission][role] },
    }));
  }

  function saveChanges() {
    toast.success("Role permissions saved successfully.");
  }

  return (
    <section aria-labelledby="roles-heading">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border">
          <h2
            id="roles-heading"
            className="font-display font-semibold text-lg flex items-center gap-2"
          >
            <Shield className="w-5 h-5 text-primary" />
            Role & Permission Editor
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Control what each role can do across the platform.
          </p>
        </div>

        <div className="overflow-x-auto" data-ocid="roles.table">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground font-medium w-56">
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th
                    key={role}
                    className="px-4 py-3 text-center text-xs uppercase tracking-wider text-muted-foreground font-medium"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          role === "Admin"
                            ? "bg-secondary text-secondary-foreground"
                            : role === "Moderator"
                              ? "bg-primary/20 text-primary"
                              : role === "Agent"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {role[0]}
                      </div>
                      {role}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERMISSIONS.map((permission, pi) => (
                <tr
                  key={permission}
                  className="hover:bg-accent/30 transition-colors"
                  data-ocid={`roles.item.${pi + 1}`}
                >
                  <td className="px-5 py-3.5 text-sm font-medium">
                    {permission}
                  </td>
                  {ROLES.map((role) => (
                    <td key={role} className="px-4 py-3.5 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={matrix[permission][role]}
                          onCheckedChange={() => toggle(permission, role)}
                          disabled={
                            permission === "Access Admin Panel" &&
                            role === "Admin"
                          }
                          aria-label={`${role}: ${permission}`}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          data-ocid="roles.checkbox"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Changes take effect immediately after saving.
          </p>
          <Button
            onClick={saveChanges}
            className="bg-primary text-primary-foreground"
            data-ocid="roles.save.button"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </section>
  );
}

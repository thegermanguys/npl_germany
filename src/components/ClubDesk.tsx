import { MAX_FRANCHISE_STAFF } from "@/lib/access";
import type { ClubStaff } from "@/lib/queries";
import type { FranchiseRow } from "@/lib/types";
import {
  FranchiseIdentityForm,
  InviteStaffForm,
  RemoveFranchiseForm,
  RemoveOwnerForm,
  RemoveStaffForm,
  SetOwnerForm,
} from "./RoleForms";

export function FranchiseRoster({
  franchise,
  staff,
}: {
  franchise: FranchiseRow;
  staff: ClubStaff[];
}) {
  return (
    <div className="club-block">
      <h4>Franchise</h4>
      <FranchiseIdentityForm franchiseId={franchise.id} city={franchise.city} name={franchise.name} />
      <h4>Owner</h4>
      <p className="staff-line">
        {franchise.owner_name ? franchise.owner_name : "No owner"}
      </p>
      {franchise.owner_user_id ? <RemoveOwnerForm franchiseId={franchise.id} /> : null}
      <SetOwnerForm franchiseId={franchise.id} />
      <h4>Staff</h4>
      <StaffList franchiseId={franchise.id} staff={staff} canEdit />
      <RemoveFranchiseForm franchiseId={franchise.id} />
    </div>
  );
}

export function StaffList({
  franchiseId,
  staff,
  canEdit,
}: {
  franchiseId: string;
  staff: ClubStaff[];
  canEdit: boolean;
}) {
  return (
    <div className="staff-list">
      {staff.length === 0 ? <p className="muted">No staff yet.</p> : null}
      {staff.map((person) => (
        <div className="staff-row" key={person.id}>
          <span>
            {person.display_name}
            <span className="muted"> {person.email}</span>
          </span>
          {canEdit ? <RemoveStaffForm franchiseId={franchiseId} userId={person.id} /> : null}
        </div>
      ))}
      {canEdit && staff.length >= MAX_FRANCHISE_STAFF ? (
        <p className="muted">A club can have two staff.</p>
      ) : null}
      {canEdit ? <InviteStaffForm franchiseId={franchiseId} /> : null}
    </div>
  );
}

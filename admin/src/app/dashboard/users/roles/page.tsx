import { RolesClient } from "./roles-client"
import { getCurrentAdminRole, getRoleSummaries } from "./actions"

export default async function UserRolesPage() {
    const [actorRole, summaries] = await Promise.all([getCurrentAdminRole(), getRoleSummaries()])

    return <RolesClient actorRole={actorRole} summaries={summaries} />
}

import { CENTER_DATA, CENTER_LIST_META, type CenterDetail } from '@/data/centers';

export type CenterListItem = {
  id: string;
  name: string;
  icon: CenterDetail['icon'];
  description: string;
  colorClass: string;
};

const DEFAULT_ID = '1';

/** Get full center detail by id. Falls back to first center if id not found. */
export function getCenterById(id: string | undefined): CenterDetail | null {
  if (!id) return null;
  const meta = CENTER_LIST_META[id] ?? CENTER_LIST_META[DEFAULT_ID];
  const content = CENTER_DATA[id] ?? CENTER_DATA[DEFAULT_ID];
  if (!meta || !content) return null;
  return {
    id,
    name: meta.name,
    icon: meta.icon,
    colorClass: meta.colorClass,
    description: content.description,
    services: content.services,
    equipment: content.equipment,
    contact: content.contact,
    additionalInfo: content.additionalInfo,
  };
}

/** Get list of centers for product-lines / listing. */
export function getCenters(): CenterListItem[] {
  return Object.entries(CENTER_LIST_META).map(([id, m]) => ({
    id,
    name: m.name,
    icon: m.icon,
    description: m.description,
    colorClass: m.colorClass,
  }));
}

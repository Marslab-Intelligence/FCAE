import taxonomy from '@/data/ticket-taxonomy.json';

/**
 * Department → Request Type → Ticket Category → Sub Category → Task.
 *
 * Mirrors the picklists in the Zoho Desk ticket form. `hasTaskLevel` marks a
 * department whose categories nest one level deeper (Cloud Infra); the others
 * stop at sub-category, so the Task field is hidden for them.
 */

export type TaskLevelTree = Record<string, Record<string, Record<string, string[]>>>;
export type FlatTree = Record<string, Record<string, string[]>>;

export interface DepartmentConfig {
  hasTaskLevel: boolean;
  /** No Zoho Desk queue of its own yet — tickets route to `fallbackDepartment`. */
  pending?: boolean;
  fallbackDepartment?: string | null;
  tree: TaskLevelTree | FlatTree;
}

const data = taxonomy as unknown as Record<string, DepartmentConfig>;

export const departments = Object.keys(data);

/** Departments with no taxonomy loaded yet can't accept a ticket. */
export const isDepartmentReady = (dept: string) =>
  Object.keys(data[dept]?.tree ?? {}).length > 0;

export const getDepartment = (dept: string): DepartmentConfig | null => data[dept] ?? null;

/** True while a department is still being set up in Zoho Desk. */
export const isDepartmentPending = (dept: string): boolean => Boolean(data[dept]?.pending);

/**
 * Where a ticket for this department should actually be created. Pending
 * departments borrow a live queue so a client's request is never dropped
 * while their own desk is being provisioned.
 */
export const resolveRoutedDepartment = (dept: string): string =>
  (data[dept]?.pending && data[dept]?.fallbackDepartment) || dept;

export const getRequestTypes = (dept: string): string[] =>
  Object.keys(data[dept]?.tree ?? {});

export const getCategories = (dept: string, requestType: string): string[] => {
  const branch = (data[dept]?.tree as Record<string, unknown>)?.[requestType];
  return branch ? Object.keys(branch as object) : [];
};

/**
 * Ticket Sub Category — mandatory in every department's Zoho layout.
 *
 * For task-level departments (Cloud Infra) these are the keys one level down,
 * with the task list below them. For flat departments the category holds the
 * sub-category list directly and there is no Task Name field at all.
 */
export const getSubCategories = (dept: string, requestType: string, category: string): string[] => {
  const cfg = data[dept];
  if (!cfg) return [];
  if (cfg.hasTaskLevel) {
    const branch = (cfg.tree as TaskLevelTree)?.[requestType]?.[category];
    return branch ? Object.keys(branch) : [];
  }
  return (cfg.tree as FlatTree)?.[requestType]?.[category] ?? [];
};

/** Task Name — only task-level departments have this fourth level. */
export const getTasks = (
  dept: string, requestType: string, category: string, subCategory: string,
): string[] => {
  const cfg = data[dept];
  if (!cfg?.hasTaskLevel) return [];
  return (cfg.tree as TaskLevelTree)?.[requestType]?.[category]?.[subCategory] ?? [];
};

export type ModuleId = 'routes' | 'benches' | 'meetings';

export type Feature = {
  id: string;
  moduleId: ModuleId;
  label: string;
  shortDescription: string;
};

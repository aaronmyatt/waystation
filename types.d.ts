interface IWaystation {
  id: string;
  name: string;
  marks: readonly IMark[];
  configuration: IWaystationConfiguration;
  tags: string[];
}

interface IMark {
  id: string;
  name?: string;
  body?: string;
  path: string;
  line?: number;
  column?: number;
  resources?: readonly IResource[];
}

type ResourceTypes = "url" | "waystation" | "note" | "path";

interface IResource {
  type: ResourceTypes;
  id: string;
  name?: string;
  body?: string;
}

interface IWaystationConfiguration {
  directory: string;
}

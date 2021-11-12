interface IWaystation {
  id: string;
  name?: string;
  marks: readonly IMark[];
  configuration: IWaystationConfiguration;
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

interface IResource {
  type: "url" | "mark" | "note" | "path";
  id: string;
  title?: string;
  description?: string;
}

interface IWaystationConfiguration {
  directory: string;
}

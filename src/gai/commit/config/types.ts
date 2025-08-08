export interface GlobalConfig {
  aiService: {
    type: string;
    command: string;
  };
  editor: string;
  defaultStyle: string;
  defaultTheme: string;
}

export interface ProjectConfig {
  style?: string;
  theme?: string;
  aiService?: {
    type?: string;
    promptTemplate?: string;
  };
}

export interface ThemeConfig {
  name: string;
  description: string;
  template: string;
  types?: Record<string, string>;
  prompts?: {
    prefix?: string;
    suffix?: string;
  };
  examples?: string[];
}

export interface StyleConfig {
  name: string;
  description: string;
  prompts: {
    prefix: string;
    suffix: string;
  };
  examples: string[];
}

export interface CommitConfig {
  global: GlobalConfig;
  project?: ProjectConfig;
  theme?: ThemeConfig;
  style?: StyleConfig;
}

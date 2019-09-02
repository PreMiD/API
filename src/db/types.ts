export interface PresenceMetadata {
  author: {
    name: string;
    id: string;
  };
  service: string;
  description: {
    [language: string]: string;
  };
  url: string | string[];
  version: string;
  logo: string;
  thumbnail: string;
  color: string;
  tags: string[];
  category: string;
  iframe?: boolean;
}

export interface Presence {
  _id?: string;
  name: string;
  url: string;
  metadata: PresenceMetadata;
  presenceJs: string;
  iframeJs?: string;
}

export interface LangFile {
  _id?: string;
  project: string;
  lang: string;
  translations: {
    [key: string]: string;
  };
}

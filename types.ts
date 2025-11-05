
export enum Tab {
  IMAGE_GENERATOR = 'Image Generator',
  IMAGE_EDITOR = 'Image Editor',
  PRO_STUDIO = 'Pro Studio',
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ProjectData {
  id: number;
  title: string;
  oneLine: string;
  tech: string[];
  demoLink: string;
  gitLink: string | string[]; // Changed to string | string[] to handle "N/A" better
  isFeatured: boolean;
  details?: string[]; // Optional array of strings for detailed points
}
export interface Parameter {
  name: string;
  default: number;
  min: number;
  max: number;
  step: number;
}

export interface GenerateResult {
  code: string;
  rawResponse: string;
  reasoning: string;
}

export interface CadServerResponse {
  success: boolean;
  error?: string;
  parameters?: Parameter[];
  has_stl?: boolean;
  has_step?: boolean;
  has_glb?: boolean;
  stl_base64?: string;
  step_base64?: string;
  glb_base64?: string;
}

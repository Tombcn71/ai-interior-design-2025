declare module "replicate" {
  export type WebhookEventType = "start" | "completed" | "output" | "logs";

  export interface PredictionStatus {
    id: string;
    version: string;
    status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
    input: Record<string, any>;
    output: string | string[] | null;
    error: string | null;
    logs: string | null;
    metrics: Record<string, any>;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    urls: {
      get: string;
      cancel: string;
    };
  }

  export interface CreatePredictionOptions {
    version: string;
    input: Record<string, any>;
    webhook?: string;
    webhook_events_filter?: WebhookEventType[];
  }

  export interface ReplicateOptions {
    auth: string;
    baseUrl?: string;
  }

  export default class Replicate {
    constructor(options?: ReplicateOptions);

    run(
      modelVersionPath: string,
      options: {
        input: Record<string, any>;
        webhook?: string;
        webhook_events_filter?: WebhookEventType[];
      }
    ): Promise<string | string[]>;

    predictions: {
      create(options: CreatePredictionOptions): Promise<PredictionStatus>;
      get(id: string): Promise<PredictionStatus>;
      list(): Promise<{ results: PredictionStatus[] }>;
      cancel(id: string): Promise<PredictionStatus>;
    };

    models: {
      get(path: string): Promise<any>;
      list(): Promise<{ results: any[] }>;
    };

    collections: {
      get(path: string): Promise<any>;
      list(): Promise<{ results: any[] }>;
    };

    deployments: {
      predictions: {
        create(options: any): Promise<any>;
        get(id: string): Promise<any>;
      };
    };
  }
}

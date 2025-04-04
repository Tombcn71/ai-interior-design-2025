export interface Design {
  id: string;
  userId: string;
  roomType?: string | null;
  style?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  resultUrl?: string | null;
  status: string;
  predictionId?: string | null;
  errorMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

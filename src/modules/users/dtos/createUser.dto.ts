export interface IUserCreationRequest {
    name: string;
    email: string;
    provider: string;
    providerId: string;
    picture?: string;
}
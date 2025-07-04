export interface VehicleDto {
    uuid: string;
    vehicleType: string;
    model: string;
    productionYear: number;
    registration: string;
    lastRegistrationDate?: string;
    validUntil?: string;
}
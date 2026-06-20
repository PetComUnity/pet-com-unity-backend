export interface SocialLink {
  platform: string;
  url: string;
}

export interface WorkingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface CreateClinicDTO {
  name: string;
  website?: string;
  registrationNumber?: string;
  phoneNumbers?: string[];
  location: string;
  workingHours?: WorkingHours;
  socialMediaLinks?: SocialLink[];
}
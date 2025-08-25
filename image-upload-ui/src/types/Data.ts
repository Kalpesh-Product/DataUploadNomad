export type PointOfContact = {
  _id: string;
  company: string; // Refers to Company._id
  name: string;
  designation: string;
  email: string;
  linkedInProfile: string;
  languagesSpoken: string[];
  address: string;
  isActive: boolean;
  __v: number;
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
};

export type Review = {
  _id: string;
  company: string; // Refers to Company._id
  name: string;
  starCount: number;
  description: string;
  reviewSource: string;
  reviewLink: string;
  __v: number;
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
};

export type Image = {
  url: string;
  index: number;
  _id: string;
};

export type Company = {
  _id: string;
  businessId: string;
  companyName: string;
  registeredEntityName: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  about: string;
  latitude: number;
  longitude: number;
  ratings: number;
  totalReviews: number;
  totalSeats: number;
  inclusions: string;
  services: string;
  companyType: string;
  __v: number;
  logo: string;
  images: Image[];
  reviews: Review[];
  poc: PointOfContact;
};

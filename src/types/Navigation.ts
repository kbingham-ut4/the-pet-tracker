import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { Pet } from './Pet';

// Root Stack Navigator Types
export type RootStackParamList = {
    Main: undefined;
    PetDetails: { petId: string };
    AddPet: undefined;
    EditPet: { pet: Pet };
    AddVetVisit: { petId: string };
    VetVisitDetails: { visitId: string };
    WeightManagement: { petId: string };
    FoodLog: { petId: string };
    Onboarding: undefined;
};

// Bottom Tab Navigator Types
export type MainTabParamList = {
    Home: undefined;
    Pets: undefined;
    Activities: undefined;
    Health: undefined;
    Profile: undefined;
};

// Navigation Props
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// Route Props
export type PetDetailsRouteProp = RouteProp<RootStackParamList, 'PetDetails'>;
export type EditPetRouteProp = RouteProp<RootStackParamList, 'EditPet'>;
export type AddVetVisitRouteProp = RouteProp<RootStackParamList, 'AddVetVisit'>;
export type VetVisitDetailsRouteProp = RouteProp<RootStackParamList, 'VetVisitDetails'>;

// Screen Props
export interface PetDetailsScreenProps {
    route: PetDetailsRouteProp;
    navigation: RootStackNavigationProp;
}

export interface EditPetScreenProps {
    route: EditPetRouteProp;
    navigation: RootStackNavigationProp;
}

export interface AddVetVisitScreenProps {
    route: AddVetVisitRouteProp;
    navigation: RootStackNavigationProp;
}

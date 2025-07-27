import { PetType } from '../types';
import { CalorieCalculator, DogCalorieCalculator } from './CalorieCalculator';

export class CalorieCalculatorFactory {
  static createCalculator(petType: PetType): CalorieCalculator {
    switch (petType) {
      case PetType.DOG:
        return new DogCalorieCalculator();
      case PetType.CAT:
        // TODO: Implement CatCalorieCalculator in future iterations
        throw new Error('Cat calorie calculator not yet implemented');
      case PetType.RABBIT:
        // TODO: Implement RabbitCalorieCalculator in future iterations
        throw new Error('Rabbit calorie calculator not yet implemented');
      default:
        throw new Error(`Calorie calculator not available for pet type: ${petType}`);
    }
  }

  static getSupportedPetTypes(): PetType[] {
    return [PetType.DOG]; // Only dogs supported in first iteration
  }

  static isSupported(petType: PetType): boolean {
    return this.getSupportedPetTypes().includes(petType);
  }
}

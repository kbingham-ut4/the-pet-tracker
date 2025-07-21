import { PetType } from '../types';

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function calculateAge(birthDate: Date): string {
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();

    if (years > 0) {
        return years === 1 ? '1 year old' : `${years} years old`;
    } else if (months > 0) {
        return months === 1 ? '1 month old' : `${months} months old`;
    } else {
        const days = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        return days === 1 ? '1 day old' : `${days} days old`;
    }
}

export function getPetTypeDisplayName(type: PetType): string {
    switch (type) {
        case PetType.DOG:
            return 'Dog';
        case PetType.CAT:
            return 'Cat';
        case PetType.BIRD:
            return 'Bird';
        case PetType.FISH:
            return 'Fish';
        case PetType.RABBIT:
            return 'Rabbit';
        case PetType.HAMSTER:
            return 'Hamster';
        case PetType.REPTILE:
            return 'Reptile';
        case PetType.OTHER:
            return 'Other';
        default:
            return 'Unknown';
    }
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

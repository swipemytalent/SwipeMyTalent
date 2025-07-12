import { HttpService } from '../services/httpService';

export interface Exchange {
    id: number;
    description: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    initiator_confirmed: boolean;
    recipient_confirmed: boolean;
    created_at: string;
    completed_at?: string;
    initiator: {
        id: number;
        firstName: string;
        lastName: string;
        avatar?: string;
        title: string;
    };
    recipient: {
        id: number;
        firstName: string;
        lastName: string;
        avatar?: string;
        title: string;
    };
    isInitiator: boolean;
}

export interface CreateExchangeRequest {
    recipient_id: number;
    description: string;
}

export interface ExchangeRatingRequest {
    exchange_id: number;
    serviceQuality: number;
    communication: number;
    timeliness: number;
}

export const createExchange = async (data: CreateExchangeRequest): Promise<{ message: string; exchange: Exchange }> => {
    return HttpService.request('/exchanges', {
        method: 'POST',
        body: data
    });
};

export const confirmExchange = async (exchangeId: number): Promise<{ message: string; status: string }> => {
    return HttpService.request(`/exchanges/${exchangeId}/confirm`, {
        method: 'PUT'
    });
};

export const completeExchange = async (exchangeId: number): Promise<{ message: string; exchange_id: number }> => {
    return HttpService.request(`/exchanges/${exchangeId}/complete`, {
        method: 'PUT'
    });
};

export const fetchUserExchanges = async (): Promise<Exchange[]> => {
    return HttpService.request('/exchanges', {
        method: 'GET'
    });
};

export const rateUserAfterExchange = async (
    userId: number, 
    ratingData: ExchangeRatingRequest
): Promise<{ message: string; averageRating: number }> => {
    return HttpService.request(`/rate/${userId}`, {
        method: 'POST',
        body: ratingData
    });
};

export const fetchExchangeRating = async (exchangeId: number): Promise<any> => {
    return HttpService.request(`/exchanges/${exchangeId}/rating`, {
        method: 'GET'
    });
}; 

import { API_URL } from '../config/api';

const logActivity = async (action, resource, details = {}, role = 'visitor') => {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/activity/log`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                action,
                resource,
                details,
                role
            })
        });

        // We don't usually blocking-wait for logs, so we just catch potential errors silently(ish)
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

export default {
    logActivity
};

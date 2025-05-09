import axiosInstance from './axiosConfig';

const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080${imagePath}`;
};

export const authService = {
    login: async (email, password) => {
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            const userData = response.data;
            if (userData.profilePicture) {
                userData.profilePicture = getFullImageUrl(userData.profilePicture);
            }
            // Store user data without the token
            const { token, ...userDataWithoutToken } = userData;
            localStorage.setItem('user', JSON.stringify(userDataWithoutToken));
            localStorage.setItem('token', token);
            return userData;
        } catch (error) {
            throw error.response?.data || 'Login failed';
        }
    },

    register: async (userData) => {
        try {
            if (userData.profileImage) {
                const formData = new FormData();
                Object.keys(userData).forEach(key => {
                    if (key === 'profileImage') {
                        formData.append('profileImage', userData.profileImage);
                    } else {
                        formData.append(key, userData[key]);
                    }
                });
                
                const response = await axiosInstance.post('/auth/register', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                return response.data;
            } else {
                const response = await axiosInstance.post('/auth/register', userData);
                return response.data;
            }
        } catch (error) {
            throw error.response?.data || 'Registration failed';
        }
    },

    logout: async () => {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            await axiosInstance.post('/auth/logout');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.clear();
            return false;
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    updateProfile: async (userId, userData) => {
        try {
            let response;
            if (userData.profileImage) {
                const formData = new FormData();
                Object.keys(userData).forEach(key => {
                    formData.append(key, userData[key]);
                });
                
                response = await axiosInstance.put(`/users/${userId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axiosInstance.put(`/users/${userId}`, userData);
            }
            const updatedUser = response.data;
            if (updatedUser.profilePicture) {
                updatedUser.profilePicture = getFullImageUrl(updatedUser.profilePicture);
            }
            return updatedUser;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateOAuthProfile: async (formData) => {
        try {
            const response = await axiosInstance.post('/users/profile', formData);
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Failed to update profile';
        }
    },

    deleteProfile: async (userId) => {
        try {
            await axiosInstance.delete(`/users/${userId}`);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } catch (error) {
            throw error.response?.data || 'Failed to delete profile';
        }
    },

    followUser: async (userId, followUserId) => {
        try {
            await axiosInstance.post(`/users/${userId}/follow/${followUserId}`);
        } catch (error) {
            throw error.response?.data || 'Failed to follow user';
        }
    },

    unfollowUser: async (userId, unfollowUserId) => {
        try {
            await axiosInstance.delete(`/users/${userId}/unfollow/${unfollowUserId}`);
        } catch (error) {
            throw error.response?.data || 'Failed to unfollow user';
        }
    }
};
import decode from 'jwt-decode';

export default class AuthService {
    isLoggedIn() {
        const localtoken = localStorage.getItem('x-access-token');
        return !!localtoken && !this.isTokenExpired(localtoken)
    };
    
    isTokenExpired(localtoken) {
        try {
            const decoded = decode(localtoken);
            
            if (decoded.exp < Date.now() / 1000) { 
                console.log('token is Expired');
                localStorage.removeItem('x-access-token');
                return true;
            }
            else {
                console.log('token is not Expired');
                return false;
            }
        }
        catch (err) {
            return false;
        }
    }

    static getCurrentUserEmail(localtoken) {
        const decoded = decode(localtoken);
        return decoded.email;
    }

    static getCurrentUserId(localtoken) {
        const decoded = decode(localtoken);
        return decoded._id;
    }
}
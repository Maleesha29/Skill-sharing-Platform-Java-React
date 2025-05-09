package Backend.util;

import java.security.SecureRandom;
import java.util.Base64;

public class SecretKeyGenerator {
    public static void main(String[] args) {
        try {
            // Generate a secure random key
            SecureRandom secureRandom = new SecureRandom();
            byte[] key = new byte[32]; // 256 bits
            secureRandom.nextBytes(key);
            
            // Convert to Base64 string
            String secretKey = Base64.getEncoder().encodeToString(key);
            
            System.out.println("Generated JWT Secret Key:");
            System.out.println(secretKey);
            System.out.println("\nAdd this to your application.properties:");
            System.out.println("jwt.secret=" + secretKey);
        } catch (Exception e) {
            System.err.println("Error generating secret key: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 
package Backend.controller;

import Backend.model.User;
import Backend.security.JwtTokenProvider;
import Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    private final Path fileStoragePath = Paths.get("Backend/uploads/profile-images").toAbsolutePath().normalize();

    public AuthController() {
        try {
            Files.createDirectories(fileStoragePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create directory for uploaded files", ex);
        }
    }

    @GetMapping("/users/profile-images/{fileName:.+}")
    @ResponseBody
    public ResponseEntity<byte[]> getProfileImage(@PathVariable String fileName) {
        try {
            Path imagePath = fileStoragePath.resolve(fileName);
            byte[] imageBytes = Files.readAllBytes(imagePath);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(imageBytes);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/register", consumes = { MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> register(
            @RequestPart(value = "username") String username,
            @RequestPart(value = "email") String email,
            @RequestPart(value = "password") String password,
            @RequestPart(value = "firstName", required = false) String firstName,
            @RequestPart(value = "lastName", required = false) String lastName,
            @RequestPart(value = "bio", required = false) String bio,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        
        try {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setBio(bio);
            
            // Process profile image if provided
            if (profileImage != null && !profileImage.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + profileImage.getOriginalFilename();
                Path targetLocation = fileStoragePath.resolve(fileName);
                Files.copy(profileImage.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                user.setProfilePicture("/api/auth/users/profile-images/" + fileName);
            }
            
            User registeredUser = userService.registerUser(user);
            // Don't return password in response
            registeredUser.setPassword(null);
            return ResponseEntity.ok(registeredUser);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload profile image: " + ex.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Alternative method for JSON requests without image
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerJson(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            // Don't return password in response
            registeredUser.setPassword(null);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            
            Optional<User> userOptional = userService.getUserByEmail(email);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                Map<String, Object> response = new HashMap<>();
                response.put("token", jwt);
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
                response.put("profilePicture", user.getProfilePicture());
                response.put("bio", user.getBio());
                
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
}
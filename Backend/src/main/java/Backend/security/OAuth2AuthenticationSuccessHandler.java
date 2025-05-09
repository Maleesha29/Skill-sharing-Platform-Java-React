package Backend.security;

import Backend.model.User;
import Backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import Backend.security.JwtTokenProvider;
import Backend.security.UserPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) 
            throws IOException, ServletException {
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        
        // Extract user info based on provider
        String email = null;
        if ("google".equals(provider)) {
            email = oAuth2User.getAttribute("email");
        } else if ("facebook".equals(provider)) {
            email = oAuth2User.getAttribute("email");
        }
        
        // Get user from database
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            response.sendRedirect("/login?error=User not found after OAuth2 authentication");
            return;
        }
        
        User user = userOptional.get();
        
        // Create user data for frontend
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("email", user.getEmail());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName", user.getLastName());
        userData.put("profilePicture", user.getProfilePicture());
        userData.put("bio", user.getBio()); 
        
        // Generate JWT token for the user
        UserDetails userDetails = UserPrincipal.create(user);
        String token = jwtTokenProvider.generateToken(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
        
        // Convert userData to JSON
        String userDataJson = new ObjectMapper().writeValueAsString(userData);
        
        // Redirect to frontend with user data and token
        String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/redirect")
                .queryParam("userData", userDataJson)
                .queryParam("token", token)
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
package com.fixit.controller;

import com.fixit.entity.Role;
import com.fixit.entity.User;
import com.fixit.dto.RegisterRequest;
import com.fixit.entity.ServiceProvider;
import com.fixit.service.ServiceProviderService;
//
import com.fixit.security.JwtUtil;
import com.fixit.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap; // <-- IMPORT THIS
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Base path for customer auth
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    // NEW: Inject ServiceProviderService for provider registration
    @Autowired
    private ServiceProviderService providerService;


    /**
     * MODIFIED: This now only registers CUSTOMERS.
     * The "role" field is removed from the request and hardcoded.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegisterRequest request) { // <-- USES NEW DTO
        if (userService.findByEmail(request.getEmail()) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setContactNo(request.getPhone()); // <-- Now it has the phone!
        user.setRole(Role.CUSTOMER);

        userService.save(user);
        return ResponseEntity.ok(Map.of("message", "Customer registered successfully"));
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginApi(@RequestBody LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            User user = (User) auth.getPrincipal();

            // Prevent admins from using the main login
            if (user.getRole() == Role.ADMIN) {
                return ResponseEntity.status(401).body(Map.of("error", "Admin must use /api/admin/login"));
            }

            String jwt = jwtUtil.generateToken(user);

            // Create the "user" object for the response
            Map<String, Object> userResponse = Map.of(
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole().name()
            );

            // Return token and user object
            return ResponseEntity.ok(Map.of("token", jwt, "user", userResponse));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }
}

@Data
class LoginRequest {
    String email;
    String password;
}

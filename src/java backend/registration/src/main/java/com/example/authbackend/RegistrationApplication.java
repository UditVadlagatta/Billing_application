package com.example.authbackend;

import com.example.authbackend.model.User;
import com.example.authbackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RegistrationApplication {

	public static void main(String[] args) {
		SpringApplication.run(RegistrationApplication.class, args);
	}

	// This bean will run once the application context is loaded
	@Bean
	CommandLineRunner createAdminUser(UserRepository userRepository) {
		return args -> {
			// Check if the 'admin' user already exists
			if (userRepository.findByUsername("admin").isEmpty()) {
				// If not, create a new admin user with the specified credentials
				User admin = new User();
				admin.setUsername("admin");
				admin.setPassword("12345678");
				userRepository.save(admin);
				System.out.println("Admin user created successfully!");
			}
		};
	}

}

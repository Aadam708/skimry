package com.skimry.skimry;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class SkimryApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkimryApplication.class, args);
	}
	@Bean
    public CommandLineRunner testDatabaseConnection(JdbcTemplate jdbcTemplate) {
        return args -> {
            System.out.println("==================================================");
            System.out.println("🔄 TESTING AIVEN DATABASE CONNECTION...");
            System.out.println("==================================================");
            
            try {
                // This executes a lightweight test query directly on your database
                Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                
                if (result != null && result == 1) {
                    System.out.println("✅ CONNECTION SUCCESSFUL! Spring Boot is officially talking to Aiven.");
                }
            } catch (Exception e) {
                System.out.println("❌ CONNECTION FAILED! See the error details below:");
                e.printStackTrace();
            }
            
            System.out.println("==================================================");
        };
    }

}

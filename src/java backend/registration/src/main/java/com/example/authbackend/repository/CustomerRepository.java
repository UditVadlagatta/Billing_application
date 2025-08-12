package com.example.authbackend.repository;

//package com.example.authbackend.repository;

import com.example.authbackend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// JpaRepository provides all the necessary CRUD operations for the Customer entity.
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}

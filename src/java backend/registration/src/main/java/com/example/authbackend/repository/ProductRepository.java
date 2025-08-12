package com.example.authbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.authbackend.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}

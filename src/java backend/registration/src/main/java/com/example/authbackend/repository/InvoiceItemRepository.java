package com.example.authbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.authbackend.model.InvoiceItem;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
	
}

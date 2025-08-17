// In InvoiceRepository.java
package com.example.authbackend.repository;

import com.example.authbackend.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findAllBy(Pageable pageable);
}
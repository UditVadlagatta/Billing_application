
package com.example.authbackend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.authbackend.model.Customer;
import com.example.authbackend.model.Invoice;
import com.example.authbackend.model.InvoiceItem;
import com.example.authbackend.model.Payment;
import com.example.authbackend.model.Product;
import com.example.authbackend.repository.CustomerRepository;
import com.example.authbackend.repository.InvoiceItemRepository;
import com.example.authbackend.repository.InvoiceRepository;
import com.example.authbackend.repository.PaymentRepository;
import com.example.authbackend.repository.ProductRepository;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          InvoiceItemRepository invoiceItemRepository,
                          CustomerRepository customerRepository,
                          ProductRepository productRepository,
                          PaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Invoice createInvoice(Long customerId, List<InvoiceItem> items, LocalDate dueDate) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(dueDate); // This line will set the due date
        invoice.setStatus("Unpaid");
        invoice.setDiscount(0.0);
        invoice.setItems(new ArrayList<>());

        BigDecimal total = BigDecimal.ZERO;

        invoice = invoiceRepository.save(invoice);

        for (InvoiceItem item : items) {
            if (item.getProduct() != null && item.getProduct().getId() != null) {
                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                item.setProduct(product);
                item.setName(product.getName());
                item.setPrice(product.getPrice());
            } else {
                if (item.getName() == null || item.getPrice() == null) {
                    throw new RuntimeException("Custom item must have name and price");
                }
                item.setProduct(null);
            }
            item.setInvoice(invoice);
            total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            invoiceItemRepository.save(item);
        }

        invoice.setTotalAmount(total.doubleValue());
        invoice.setBalanceDue(total.doubleValue());
        return invoiceRepository.save(invoice);
    }
    
    public List<Invoice> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAllBy(pageable);
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoiceRepository.delete(invoice);
    }

    @Transactional
    public Invoice recordPayment(Long invoiceId, Payment payment) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.getPayments().add(payment);
        BigDecimal paymentAmount = payment.getAmount();
        double newBalanceDue = invoice.getBalanceDue() - paymentAmount.doubleValue();
        invoice.setBalanceDue(newBalanceDue);
        invoice.setStatus(newBalanceDue <= 0 ? "Paid" : "Partially Paid");
        paymentRepository.save(payment);
        return invoiceRepository.save(invoice);
    }
}

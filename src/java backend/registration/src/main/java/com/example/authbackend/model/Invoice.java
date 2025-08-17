package com.example.authbackend.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate invoiceDate;
    private double totalAmount;
    private double discount;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private double balanceDue;
    
    private String status;
    private LocalDate dueDate;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<InvoiceItem> items = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "invoice_id")
    @JsonManagedReference
    private List<Payment> payments = new ArrayList<>();

    // Constructors, getters, setters
    public Invoice() {}

    public Invoice(Long id, LocalDate invoiceDate, double totalAmount, Customer customer, List<InvoiceItem> items,
                   double discount, double balanceDue, String status, LocalDate dueDate, List<Payment> payments) {
        this.id = id;
        this.invoiceDate = invoiceDate;
        this.totalAmount = totalAmount;
        this.customer = customer;
        this.items = items;
        this.discount = discount;
        this.balanceDue = balanceDue;
        this.status = status;
        this.dueDate = dueDate;
        this.payments = payments;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public List<InvoiceItem> getItems() { return items; }
    public void setItems(List<InvoiceItem> items) { this.items = items; }
    public double getDiscount() { return discount; }
    public void setDiscount(double discount) { this.discount = discount; }
    public double getBalanceDue() { return balanceDue; }
    public void setBalanceDue(double balanceDue) { this.balanceDue = balanceDue; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public List<Payment> getPayments() { return payments; }
    public void setPayments(List<Payment> payments) { this.payments = payments; }

    @Override
    public String toString() {
        return "Invoice [id=" + id + ", invoiceDate=" + invoiceDate + ", totalAmount=" + totalAmount +
               ", customer=" + customer + ", items=" + items + ", discount=" + discount +
               ", balanceDue=" + balanceDue + ", status=" + status + ", dueDate=" + dueDate +
               ", payments=" + payments + "]";
    }
}
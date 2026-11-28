package com.skimry.skimry.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "deleted_account_guards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeletedAccountGuard {

    @Id
    @Column(name = "email_hash", nullable = false, length = 64)
    private String emailHash;

    @Column(name = "prior_skims_used", nullable = false)
    @Builder.Default
    private Integer priorSkimsUsed = 0;

    @Column(name = "last_reset_date")
    private LocalDate lastResetDate;

    @Column(name = "deleted_at", nullable = false)
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        if (this.priorSkimsUsed == null) {
            this.priorSkimsUsed = 0;
        }
        if (this.deletedAt == null) {
            this.deletedAt = LocalDateTime.now();
        }
    }
}

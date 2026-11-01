package com.billing.master.dto;

import lombok.Data;

@Data
public class CategorySaveRequest {
    private Long id;
    private String name;
    private Integer discType;
    private Double discount;
}

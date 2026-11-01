package com.billing.master.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CategoryData extends NamedItemData {
    private Integer discType;
    private Double discount;
}

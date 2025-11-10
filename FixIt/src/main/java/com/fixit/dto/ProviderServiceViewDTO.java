package com.fixit.dto;

import com.fixit.entity.Service;
import com.fixit.entity.ServiceCategory;
import lombok.Data;
import java.math.BigDecimal;

// provider's services on their dashboard.

@Data
public class ProviderServiceViewDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private CategoryInfo category;

    @Data
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String icon;

        public CategoryInfo(ServiceCategory sc) {
            if (sc != null) {
                this.id = sc.getId();
                this.name = sc.getName();
                this.icon = sc.getIcon();
            }
        }
    }

    public ProviderServiceViewDTO(Service service) {
        this.id = service.getId();
        this.name = service.getName();
        this.description = service.getDescription();
        this.price = service.getPrice();
        this.category = new CategoryInfo(service.getServiceCategory());
    }
}
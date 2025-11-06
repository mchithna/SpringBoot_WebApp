package com.fixit.service;

import com.fixit.entity.ServiceProvider;
import com.fixit.entity.VerificationStatus;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.ServiceProviderRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final ServiceProviderRepository providerRepository;
    private final ServiceProviderService providerService;

    public AdminService(ServiceProviderRepository providerRepository, ServiceProviderService providerService) {
        this.providerRepository = providerRepository;
        this.providerService = providerService;
    }

    //Approves a service provider.

    public ServiceProvider approveProvider(Long providerId) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        provider.setStatus(VerificationStatus.VERIFIED);
        return providerRepository.save(provider);
    }

    //Suspends a service provider.

    public ServiceProvider suspendProvider(Long providerId) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        provider.setStatus(VerificationStatus.SUSPENDED);
        return providerRepository.save(provider);
    }

    // More to come ...
}
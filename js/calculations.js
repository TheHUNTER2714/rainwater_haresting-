// RTRWH Calculations Module - AquaHarvest
class RainwaterCalculator {
    constructor(assessmentData = {}, locationData = null) {
        this.assessmentData = assessmentData;
        this.locationData = locationData;
        
        // Constants and coefficients
        this.runoffCoefficients = {
            'concrete': 0.85,
            'metal': 0.92,
            'tiles': 0.70,
            'asbestos': 0.85
        };
        
        this.soilPermeability = {
            'sandy': 0.9,
            'loamy': 0.7,
            'clayey': 0.4,
            'rocky': 0.2,
            'mixed': 0.6
        };
        
        // Regional rainfall data (mm/year) - simplified for demonstration
        this.regionalRainfall = {
            'default': [15, 20, 25, 30, 45, 120, 180, 160, 110, 40, 20, 15], // Monthly
            'mumbai': [5, 10, 15, 25, 35, 500, 850, 650, 350, 50, 15, 5],
            'bangalore': [10, 15, 20, 40, 80, 150, 200, 180, 160, 120, 50, 20],
            'chennai': [25, 20, 15, 35, 50, 45, 85, 120, 180, 250, 180, 80],
            'delhi': [20, 25, 15, 10, 20, 80, 200, 220, 120, 15, 5, 10],
            'kolkata': [15, 30, 40, 50, 120, 280, 350, 320, 250, 100, 20, 10]
        };
        
        // Cost matrices (INR)
        this.costFactors = {
            storage: {
                perLiter: 45, // Cost per liter of storage capacity
                installation: 15000, // Base installation cost
                accessories: 8000 // Pumps, filters, etc.
            },
            recharge: {
                perCubicMeter: 2500, // Cost per cubic meter of recharge pit
                excavation: 150, // Per cubic meter excavation
                materials: 1200 // Per cubic meter (stones, sand, etc.)
            },
            filtration: {
                basic: 8000,
                advanced: 25000,
                maintenance: 1500 // Annual
            },
            piping: {
                perMeter: 180,
                fittings: 5000
            }
        };
        
        // Environmental factors
        this.carbonFactors = {
            waterSaved: 0.0012, // kg CO2 per liter of water saved
            constructionImpact: 0.8, // kg CO2 per ₹1000 spent on construction
            maintenance: 0.3 // kg CO2 per ₹1000 annual maintenance
        };
    }

    generateReport() {
        try {
            // Basic validation
            if (!this.validateInputData()) {
                throw new Error('Invalid input data provided');
            }

            // Core calculations
            const rainfallData = this.getRainfallData();
            const roofArea = parseFloat(this.assessmentData.roofArea) || 100;
            const runoffCoeff = this.getRunoffCoefficient();
            const soilPerm = this.getSoilPermeability();
            
            // Calculate water collection potential
            const collectionPotential = this.calculateCollectionPotential(rainfallData, roofArea, runoffCoeff);
            
            // Calculate system requirements
            const systemRequirements = this.calculateSystemRequirements(collectionPotential);
            
            // Calculate costs
            const costAnalysis = this.calculateCosts(systemRequirements);
            
            // Calculate environmental impact
            const environmentalImpact = this.calculateEnvironmentalImpact(collectionPotential, costAnalysis);
            
            // Calculate feasibility score
            const feasibilityScore = this.calculateFeasibilityScore(collectionPotential, costAnalysis, soilPerm);
            
            // Generate recommendations
            const recommendations = this.generateRecommendations(feasibilityScore, systemRequirements, costAnalysis);
            
            return {
                feasibilityScore,
                annualPotential: Math.round(collectionPotential.annual),
                monthlyAverage: Math.round(collectionPotential.annual / 12),
                peakMonthly: Math.round(Math.max(...collectionPotential.monthly)),
                
                initialCost: Math.round(costAnalysis.total),
                annualSavings: Math.round(costAnalysis.savings.annual),
                paybackPeriod: costAnalysis.payback,
                
                recommendedCapacity: systemRequirements.storageCapacity,
                rechargeDimensions: systemRequirements.rechargeDimensions,
                systemType: systemRequirements.recommendedSystem,
                
                rainfallData: rainfallData,
                carbonSaved: environmentalImpact.annualCO2Saved,
                waterSavingsPercent: Math.round((collectionPotential.annual / (parseFloat(this.assessmentData.dailyUsage) * 365)) * 100),
                
                groundwaterLevel: this.getGroundwaterLevel(),
                aquiferType: this.getAquiferType(),
                avgRainfall: Math.round(rainfallData.reduce((a, b) => a + b, 0)),
                
                recommendations,
                detailedBreakdown: this.getDetailedBreakdown(collectionPotential, systemRequirements, costAnalysis)
            };
            
        } catch (error) {
            console.error('Error generating report:', error);
            return this.getDefaultReport();
        }
    }

    validateInputData() {
        const required = ['roofArea', 'roofType', 'soilType', 'dailyUsage'];
        return required.every(field => this.assessmentData[field]);
    }

    getRainfallData() {
        // Determine region based on location or use default
        const region = this.determineRegion();
        return this.regionalRainfall[region] || this.regionalRainfall['default'];
    }

    determineRegion() {
        if (this.locationData) {
            const { latitude, longitude } = this.locationData;
            
            // Simple region determination based on coordinates
            // Mumbai region
            if (latitude >= 18.0 && latitude <= 20.0 && longitude >= 72.0 && longitude <= 73.5) {
                return 'mumbai';
            }
            // Bangalore region
            if (latitude >= 12.0 && latitude <= 14.0 && longitude >= 77.0 && longitude <= 78.0) {
                return 'bangalore';
            }
            // Chennai region  
            if (latitude >= 12.5 && latitude <= 13.5 && longitude >= 79.5 && longitude <= 80.5) {
                return 'chennai';
            }
            // Delhi region
            if (latitude >= 28.0 && latitude <= 29.0 && longitude >= 76.5 && longitude <= 77.5) {
                return 'delhi';
            }
            // Kolkata region
            if (latitude >= 22.0 && latitude <= 23.0 && longitude >= 88.0 && longitude <= 89.0) {
                return 'kolkata';
            }
        }
        
        return 'default';
    }

    getRunoffCoefficient() {
        return this.runoffCoefficients[this.assessmentData.roofType] || 0.8;
    }

    getSoilPermeability() {
        return this.soilPermeability[this.assessmentData.soilType] || 0.6;
    }

    calculateCollectionPotential(rainfallData, roofArea, runoffCoeff) {
        // Formula: Collection = Roof Area (m²) × Rainfall (mm) × Runoff Coefficient × 0.001 (conversion factor)
        const monthly = rainfallData.map(rainfall => 
            roofArea * rainfall * runoffCoeff * 0.001 * 1000 // Convert to liters
        );
        
        const annual = monthly.reduce((total, month) => total + month, 0);
        
        // Account for first flush diverter (lose ~5% of initial rain)
        const effectiveAnnual = annual * 0.95;
        const effectiveMonthly = monthly.map(month => month * 0.95);
        
        return {
            annual: effectiveAnnual,
            monthly: effectiveMonthly,
            peakMonth: Math.max(...effectiveMonthly),
            leanMonth: Math.min(...effectiveMonthly.filter(m => m > 0))
        };
    }

    calculateSystemRequirements(collectionPotential) {
        const dailyUsage = parseFloat(this.assessmentData.dailyUsage) || 300;
        const availableSpace = parseFloat(this.assessmentData.availableSpace) || 50;
        const budget = this.getBudgetRange();
        
        // Storage capacity calculation
        // Aim for 15-30 days of storage or 1/3 of monthly peak, whichever is smaller
        const storageOptions = [
            dailyUsage * 15, // 15 days storage
            dailyUsage * 30, // 30 days storage  
            collectionPotential.peakMonth * 0.33 // 1/3 of peak month
        ];
        
        let storageCapacity = Math.min(...storageOptions);
        
        // Adjust based on budget constraints
        if (budget.max < 100000) {
            storageCapacity = Math.min(storageCapacity, 3000); // Limit to 3000L for low budget
        } else if (budget.max < 200000) {
            storageCapacity = Math.min(storageCapacity, 7000); // Limit to 7000L for medium budget
        }
        
        // Round to nearest 500L
        storageCapacity = Math.round(storageCapacity / 500) * 500;
        
        // Recharge pit calculations
        const excessWater = Math.max(0, collectionPotential.annual - (storageCapacity * 2)); // Assume tank fills twice
        const rechargePitVolume = Math.min(excessWater / 1000, availableSpace * 0.3); // Max 30% of available space
        
        const rechargeDimensions = this.calculateRechargeDimensions(rechargePitVolume, availableSpace);
        
        // System type recommendation
        const systemType = this.recommendSystemType(storageCapacity, rechargePitVolume, budget);
        
        return {
            storageCapacity,
            rechargePitVolume,
            rechargeDimensions,
            recommendedSystem: systemType,
            pumpCapacity: this.calculatePumpRequirement(storageCapacity),
            filtrationLevel: this.recommendFiltration()
        };
    }

    getBudgetRange() {
        const budgetStr = this.assessmentData.budget || '100000';
        const budget = parseInt(budgetStr);
        
        if (budget <= 25000) return { min: 15000, max: 25000 };
        if (budget <= 50000) return { min: 25000, max: 50000 };
        if (budget <= 100000) return { min: 50000, max: 100000 };
        if (budget <= 200000) return { min: 100000, max: 200000 };
        if (budget <= 300000) return { min: 200000, max: 300000 };
        return { min: 300000, max: 500000 };
    }

    calculateRechargeDimensions(volume, availableSpace) {
        if (volume <= 0) return "Not recommended";
        
        // Standard recharge pit ratios (length:width:depth = 2:1:1.5)
        const depth = Math.min(2.5, Math.max(1.0, volume ** (1/3))); // Between 1-2.5m depth
        const width = Math.min(Math.sqrt(availableSpace / 3), volume / (depth * 2));
        const length = Math.min(width * 2, availableSpace / width);
        
        return `${length.toFixed(1)}m × ${width.toFixed(1)}m × ${depth.toFixed(1)}m`;
    }

    recommendSystemType(storageCapacity, rechargePitVolume, budget) {
        if (budget.max < 50000) {
            return "Basic Collection System";
        } else if (rechargePitVolume > 5 && storageCapacity > 3000) {
            return "Hybrid Storage + Recharge System";
        } else if (storageCapacity > rechargePitVolume * 1000) {
            return "Storage-Focused System";
        } else {
            return "Recharge-Focused System";
        }
    }

    calculatePumpRequirement(storageCapacity) {
        // Pump capacity in liters per hour
        if (storageCapacity < 2000) return 1000;
        if (storageCapacity < 5000) return 1500;
        if (storageCapacity < 10000) return 2000;
        return 2500;
    }

    recommendFiltration() {
        const intendedUse = this.assessmentData.intendedUse || [];
        
        if (intendedUse.includes('drinking')) {
            return 'Advanced Multi-stage Filtration';
        } else if (intendedUse.includes('domestic')) {
            return 'Standard Filtration with UV';
        } else {
            return 'Basic Sediment Filtration';
        }
    }

    calculateCosts(systemRequirements) {
        const costs = {
            storage: 0,
            recharge: 0,
            filtration: 0,
            piping: 0,
            installation: 0,
            maintenance: 0
        };

        // Storage costs
        costs.storage = systemRequirements.storageCapacity * this.costFactors.storage.perLiter;
        costs.storage += this.costFactors.storage.installation;
        costs.storage += this.costFactors.storage.accessories;

        // Recharge pit costs
        if (systemRequirements.rechargePitVolume > 0) {
            costs.recharge = systemRequirements.rechargePitVolume * this.costFactors.recharge.perCubicMeter;
            costs.recharge += systemRequirements.rechargePitVolume * this.costFactors.recharge.excavation;
            costs.recharge += systemRequirements.rechargePitVolume * this.costFactors.recharge.materials;
        }

        // Filtration costs
        const filtrationLevel = systemRequirements.filtrationLevel;
        if (filtrationLevel.includes('Advanced')) {
            costs.filtration = this.costFactors.filtration.advanced;
        } else {
            costs.filtration = this.costFactors.filtration.basic;
        }

        // Piping costs (estimate based on roof area)
        const roofArea = parseFloat(this.assessmentData.roofArea) || 100;
        const pipeLength = Math.sqrt(roofArea) * 4; // Rough estimate
        costs.piping = pipeLength * this.costFactors.piping.perMeter;
        costs.piping += this.costFactors.piping.fittings;

        // Installation costs (15% of material costs)
        costs.installation = (costs.storage + costs.recharge + costs.filtration + costs.piping) * 0.15;

        // Annual maintenance (3% of total system cost)
        const totalSystemCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
        costs.maintenance = totalSystemCost * 0.03 + this.costFactors.filtration.maintenance;

        // Calculate savings
        const currentWaterCost = parseFloat(this.assessmentData.waterCost) || 1500;
        const monthlyWaterCost = currentWaterCost;
        const annualWaterCost = monthlyWaterCost * 12;
        
        // Assume 30-60% water bill savings based on system capacity
        const dailyUsage = parseFloat(this.assessmentData.dailyUsage) || 300;
        const annualUsage = dailyUsage * 365;
        const systemCapacity = systemRequirements.storageCapacity * 24; // Assume 24 refills per year
        
        const savingsPercentage = Math.min(0.6, systemCapacity / annualUsage);
        const annualSavings = annualWaterCost * savingsPercentage - costs.maintenance;
        
        const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0) - costs.maintenance;
        const paybackPeriod = annualSavings > 0 ? (total / annualSavings).toFixed(1) : "N/A";

        return {
            breakdown: costs,
            total,
            savings: {
                annual: Math.max(0, annualSavings),
                percentage: savingsPercentage * 100
            },
            payback: paybackPeriod
        };
    }

    calculateEnvironmentalImpact(collectionPotential, costAnalysis) {
        // CO2 savings from reduced water treatment and distribution
        const waterCO2Savings = collectionPotential.annual * this.carbonFactors.waterSaved;
        
        // CO2 impact from construction
        const constructionImpact = (costAnalysis.total / 1000) * this.carbonFactors.constructionImpact;
        
        // Annual maintenance impact
        const maintenanceImpact = (costAnalysis.breakdown.maintenance / 1000) * this.carbonFactors.maintenance;
        
        // Net annual CO2 savings (after amortizing construction impact over 20 years)
        const annualCO2Saved = waterCO2Savings - (constructionImpact / 20) - maintenanceImpact;
        
        return {
            annualCO2Saved: Math.max(0, annualCO2Saved).toFixed(1),
            waterCO2Savings,
            constructionImpact,
            maintenanceImpact
        };
    }

    calculateFeasibilityScore(collectionPotential, costAnalysis, soilPermeability) {
        let score = 0;
        
        // Water collection potential (40% weight)
        const dailyUsage = parseFloat(this.assessmentData.dailyUsage) || 300;
        const annualUsage = dailyUsage * 365;
        const collectionRatio = collectionPotential.annual / annualUsage;
        score += Math.min(40, collectionRatio * 40);
        
        // Economic feasibility (35% weight)
        const payback = parseFloat(costAnalysis.payback);
        if (payback <= 3) score += 35;
        else if (payback <= 5) score += 25;
        else if (payback <= 8) score += 15;
        else if (payback <= 12) score += 5;
        
        // Soil suitability (15% weight)
        score += soilPermeability * 15;
        
        // Space availability (10% weight)
        const availableSpace = parseFloat(this.assessmentData.availableSpace) || 0;
        const roofArea = parseFloat(this.assessmentData.roofArea) || 100;
        const spaceRatio = Math.min(1, availableSpace / (roofArea * 0.3));
        score += spaceRatio * 10;
        
        return Math.round(Math.min(100, Math.max(0, score)));
    }

    generateRecommendations(feasibilityScore, systemRequirements, costAnalysis) {
        const recommendations = [];
        
        if (feasibilityScore >= 80) {
            recommendations.push({
                priority: 'high',
                category: 'Implementation',
                title: 'Proceed with Full System Installation',
                description: 'Your property shows excellent potential. Consider implementing the complete recommended system.',
                action: 'Contact certified installers for detailed planning and implementation.'
            });
        } else if (feasibilityScore >= 60) {
            recommendations.push({
                priority: 'medium',
                category: 'Phased Implementation',
                title: 'Consider Phased Installation',
                description: 'Start with basic collection and storage, then expand to recharge system.',
                action: 'Begin with storage tank installation and add recharge components later.'
            });
        } else {
            recommendations.push({
                priority: 'low',
                category: 'Alternative Solutions',
                title: 'Explore Alternative Water Conservation',
                description: 'Consider other water-saving methods like greywater recycling or demand reduction.',
                action: 'Focus on water conservation practices and explore community-level solutions.'
            });
        }
        
        // Technical recommendations
        if (systemRequirements.storageCapacity > 5000) {
            recommendations.push({
                priority: 'high',
                category: 'Technical',
                title: 'Large Storage System Design',
                description: 'Your system requires significant storage capacity. Consider modular tank design.',
                action: 'Use multiple smaller tanks instead of one large tank for better maintenance and reliability.'
            });
        }
        
        // Economic recommendations
        if (parseFloat(costAnalysis.payback) > 8) {
            recommendations.push({
                priority: 'medium',
                category: 'Economic',
                title: 'Optimize System Size',
                description: 'Consider reducing system size to improve economic viability.',
                action: 'Focus on meeting 30-40% of water needs rather than full requirement.'
            });
        }
        
        // Maintenance recommendations
        recommendations.push({
            priority: 'medium',
            category: 'Maintenance',
            title: 'Regular System Maintenance',
            description: 'Establish a maintenance schedule to ensure optimal performance.',
            action: 'Plan for quarterly cleaning and annual professional inspection.'
        });
        
        return recommendations;
    }

    getGroundwaterLevel() {
        // Simulated groundwater level based on region
        const region = this.determineRegion();
        const levels = {
            'mumbai': 8.5,
            'bangalore': 12.2,
            'chennai': 6.8,
            'delhi': 18.7,
            'kolkata': 4.2,
            'default': 12.0
        };
        
        return levels[region] || levels['default'];
    }

    getAquiferType() {
        const region = this.determineRegion();
        const types = {
            'mumbai': 'Basaltic Rock',
            'bangalore': 'Crystalline Rock',
            'chennai': 'Sedimentary',
            'delhi': 'Alluvium',
            'kolkata': 'Alluvium',
            'default': 'Mixed Aquifer'
        };
        
        return types[region] || types['default'];
    }

    getDetailedBreakdown(collectionPotential, systemRequirements, costAnalysis) {
        return {
            waterBalance: {
                totalCollection: Math.round(collectionPotential.annual),
                storageUtilization: Math.round(systemRequirements.storageCapacity * 24),
                rechargeContribution: Math.round(systemRequirements.rechargePitVolume * 1000),
                overflow: Math.round(Math.max(0, collectionPotential.annual - (systemRequirements.storageCapacity * 24) - (systemRequirements.rechargePitVolume * 1000)))
            },
            costBreakdown: costAnalysis.breakdown,
            technicalSpecs: {
                pumpCapacity: systemRequirements.pumpCapacity,
                filtrationLevel: systemRequirements.filtrationLevel,
                systemType: systemRequirements.recommendedSystem,
                estimatedLifespan: '20-25 years'
            },
            performanceMetrics: {
                collectionEfficiency: Math.round((collectionPotential.annual / (parseFloat(this.assessmentData.roofArea) * this.getRainfallData().reduce((a,b) => a + b, 0))) * 100),
                costPerLiter: (costAnalysis.total / collectionPotential.annual).toFixed(2),
                dailyCoverage: Math.round((collectionPotential.annual / 365) / parseFloat(this.assessmentData.dailyUsage) * 100)
            }
        };
    }

    getDefaultReport() {
        // Fallback report in case of errors
        return {
            feasibilityScore: 50,
            annualPotential: 15000,
            monthlyAverage: 1250,
            peakMonthly: 3500,
            initialCost: 75000,
            annualSavings: 12000,
            paybackPeriod: "6.3",
            recommendedCapacity: 3000,
            rechargeDimensions: "2.0m × 1.5m × 1.5m",
            systemType: "Basic Collection System",
            rainfallData: [15, 20, 25, 30, 45, 120, 180, 160, 110, 40, 20, 15],
            carbonSaved: 2.8,
            waterSavingsPercent: 35,
            groundwaterLevel: 12.0,
            aquiferType: "Mixed Aquifer",
            avgRainfall: 800,
            recommendations: [{
                priority: 'medium',
                category: 'Assessment',
                title: 'Complete Assessment Required',
                description: 'Please provide complete information for accurate analysis.',
                action: 'Fill in all required fields and retry the assessment.'
            }],
            detailedBreakdown: {
                waterBalance: { totalCollection: 15000, storageUtilization: 12000, rechargeContribution: 3000, overflow: 0 },
                costBreakdown: { storage: 45000, recharge: 15000, filtration: 8000, piping: 7000, installation: 0, maintenance: 2250 },
                technicalSpecs: { pumpCapacity: 1500, filtrationLevel: 'Basic Filtration', systemType: 'Basic Collection System', estimatedLifespan: '20-25 years' },
                performanceMetrics: { collectionEfficiency: 85, costPerLiter: '5.00', dailyCoverage: 40 }
            }
        };
    }
}

// Make available globally
window.RainwaterCalculator = RainwaterCalculator;

// Export for use in Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RainwaterCalculator;
}

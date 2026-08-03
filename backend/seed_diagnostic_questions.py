"""
Seed script: Pre-built diagnostic question bank for the assessment system.

Each question is designed to reveal mental models, not just test recall.
Wrong answers map to specific, documented misconceptions.

Run: ./backend/venv/bin/python backend/seed_diagnostic_questions.py
"""

import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.abspath("backend"))

from supabase import create_client

QUESTIONS = [
    # =========================================================================
    # DOMAIN: robotics (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "robotics",
        "tier": 1,
        "stem": "What are the three main physical components of a robot system?",
        "options": [
            {"text": "Sensors, Actuators, and Controllers", "tag": "correct"},
            {"text": "Keyboards, Monitors, and Mice", "tag": "misconception_pc_parts"},
            {"text": "Lasers, Jetpacks, and AI", "tag": "misconception_sci_fi"},
            {"text": "Gears, Wheels, and Pulleys", "tag": "misconception_pure_mechanical"}
        ],
        "correct_index": 0,
        "concepts_tested": ["robot_components", "sensors", "actuators"],
        "misconceptions_detected": {"1": "robot_is_desktop_pc", "2": "robot_is_scifi_trope", "3": "robot_is_unpowered_machine"}
    },
    {
        "domain_slug": "robotics",
        "tier": 1,
        "stem": "What is the purpose of an 'actuator' in a robot?",
        "options": [
            {"text": "To process data and make decisions", "tag": "misconception_controller"},
            {"text": "To convert energy into physical motion or mechanical force", "tag": "correct"},
            {"text": "To sense the environment (e.g., see or hear)", "tag": "misconception_sensor"},
            {"text": "To store electrical energy", "tag": "misconception_battery"}
        ],
        "correct_index": 1,
        "concepts_tested": ["actuators", "motor_control"],
        "misconceptions_detected": {"0": "actuator_is_cpu", "2": "actuator_is_sensor", "3": "actuator_is_battery"}
    },
    {
        "domain_slug": "robotics",
        "tier": 1,
        "stem": "In robotics, what does 'Degrees of Freedom' (DoF) refer to?",
        "options": [
            {"text": "The amount of artificial intelligence the robot has", "tag": "misconception_ai_autonomy"},
            {"text": "The number of independent parameters or joints that define the robot's configuration in space", "tag": "correct"},
            {"text": "The maximum speed the robot can travel", "tag": "misconception_speed"},
            {"text": "The distance a robot can travel away from its base station", "tag": "misconception_range"}
        ],
        "correct_index": 1,
        "concepts_tested": ["degrees_of_freedom", "kinematics"],
        "misconceptions_detected": {"0": "dof_is_ai_level", "2": "dof_is_speed", "3": "dof_is_range"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "robotics",
        "tier": 2,
        "stem": "What is the difference between 'forward kinematics' and 'inverse kinematics'?",
        "options": [
            {"text": "Forward moves the robot forward; inverse moves it backward", "tag": "misconception_literal_movement"},
            {"text": "Forward calculates the end-effector position given the joint angles; inverse calculates the required joint angles to reach a desired end-effector position", "tag": "correct"},
            {"text": "Forward is used for wheeled robots; inverse is used for flying drones", "tag": "misconception_vehicle_type"},
            {"text": "Forward applies to hardware; inverse applies to software simulation", "tag": "misconception_hardware_software"}
        ],
        "correct_index": 1,
        "concepts_tested": ["kinematics", "forward_kinematics", "inverse_kinematics"],
        "misconceptions_detected": {"0": "kinematics_is_direction", "2": "kinematics_tied_to_locomotion", "3": "kinematics_is_sim_vs_real"}
    },
    {
        "domain_slug": "robotics",
        "tier": 2,
        "stem": "In autonomous navigation, what does SLAM stand for?",
        "options": [
            {"text": "Simultaneous Localization and Mapping", "tag": "correct"},
            {"text": "Sensory Logic and Machine learning", "tag": "misconception_sensory_logic"},
            {"text": "Spatial Location and Memory", "tag": "misconception_spatial_location"},
            {"text": "System Level Automated Movement", "tag": "misconception_system_movement"}
        ],
        "correct_index": 0,
        "concepts_tested": ["slam", "navigation", "mapping"],
        "misconceptions_detected": {"1": "slam_is_machine_learning", "2": "slam_is_memory", "3": "slam_is_movement"}
    },
    {
        "domain_slug": "robotics",
        "tier": 2,
        "stem": "Why are PID (Proportional-Integral-Derivative) controllers commonly used in robot motor control?",
        "options": [
            {"text": "To give the robot the ability to understand human speech", "tag": "misconception_nlp"},
            {"text": "To smoothly and accurately drive a motor to a target position or speed by minimizing the error over time", "tag": "correct"},
            {"text": "To permanently store the robot's operating system", "tag": "misconception_storage"},
            {"text": "To automatically generate 3D maps of the environment", "tag": "misconception_mapping"}
        ],
        "correct_index": 1,
        "concepts_tested": ["control_systems", "pid", "motor_control"],
        "misconceptions_detected": {"0": "pid_is_nlp", "2": "pid_is_memory", "3": "pid_is_mapping"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "robotics",
        "tier": 3,
        "stem": "When designing a quadruped (four-legged) robot for walking, what is the 'Center of Mass' (CoM) constraint for static stability?",
        "options": [
            {"text": "The CoM must be exactly in the geometric center of the robot's body", "tag": "misconception_geometric_center"},
            {"text": "The vertical projection of the CoM must fall within the support polygon formed by the feet currently touching the ground", "tag": "correct"},
            {"text": "The CoM must constantly shift outside the support polygon to maintain momentum", "tag": "misconception_dynamic_walking"},
            {"text": "The CoM must be higher than the knee joints", "tag": "misconception_high_com"}
        ],
        "correct_index": 1,
        "concepts_tested": ["locomotion", "stability", "center_of_mass"],
        "misconceptions_detected": {"0": "stability_requires_symmetry", "2": "confusing_static_with_dynamic", "3": "high_com_improves_stability"}
    },
    {
        "domain_slug": "robotics",
        "tier": 3,
        "stem": "In computer vision for robotics, what is an 'occupancy grid'?",
        "options": [
            {"text": "A schedule of when human operators are allowed to use the robot", "tag": "misconception_schedule"},
            {"text": "A 2D or 3D map where space is divided into cells, and each cell holds a probability value of whether it contains an obstacle", "tag": "correct"},
            {"text": "The physical layout of transistors on the robot's motherboard", "tag": "misconception_pcb_layout"},
            {"text": "A method for allocating battery power to different motors", "tag": "misconception_power_management"}
        ],
        "correct_index": 1,
        "concepts_tested": ["mapping", "occupancy_grid", "perception"],
        "misconceptions_detected": {"0": "occupancy_is_scheduling", "2": "occupancy_is_hardware", "3": "occupancy_is_power"}
    },
    {
        "domain_slug": "robotics",
        "tier": 3,
        "stem": "A robot arm exhibits 'singularities' in its workspace. What happens at a singularity?",
        "options": [
            {"text": "The robot achieves maximum possible strength and precision", "tag": "misconception_optimal_performance"},
            {"text": "The robot loses one or more degrees of freedom, and inverse kinematics calculations often fail (e.g., divide by zero) requiring infinite joint speeds to move in certain directions", "tag": "correct"},
            {"text": "The robot becomes self-aware", "tag": "misconception_singularity_ai"},
            {"text": "The robot's power supply temporarily disconnects", "tag": "misconception_power_failure"}
        ],
        "correct_index": 1,
        "concepts_tested": ["kinematics", "singularities", "manipulators"],
        "misconceptions_detected": {"0": "singularity_is_good", "2": "singularity_is_ai", "3": "singularity_is_electrical"}
    },

    # =========================================================================
    # DOMAIN: materials-science (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "materials-science",
        "tier": 1,
        "stem": "What is the defining characteristic of a 'crystalline' material (like most metals and ceramics)?",
        "options": [
            {"text": "It is completely transparent to visible light", "tag": "misconception_transparency"},
            {"text": "Its atoms or molecules are arranged in a strictly ordered, repeating 3D lattice structure", "tag": "correct"},
            {"text": "It is extremely brittle and breaks easily", "tag": "misconception_brittleness"},
            {"text": "It can be easily stretched like rubber", "tag": "misconception_elasticity"}
        ],
        "correct_index": 1,
        "concepts_tested": ["crystal_structure", "atomic_arrangement"],
        "misconceptions_detected": {"0": "crystal_means_glassy", "2": "crystal_means_fragile", "3": "crystal_means_polymer"}
    },
    {
        "domain_slug": "materials-science",
        "tier": 1,
        "stem": "What is an 'alloy'?",
        "options": [
            {"text": "A pure metal extracted directly from ore", "tag": "misconception_pure_metal"},
            {"text": "A mixture composed of two or more elements, at least one of which is a metal, created to improve properties (e.g., steel, bronze)", "tag": "correct"},
            {"text": "A type of industrial-strength plastic", "tag": "misconception_polymer"},
            {"text": "A compound made exclusively of non-metals", "tag": "misconception_covalent_compound"}
        ],
        "correct_index": 1,
        "concepts_tested": ["alloys", "metals"],
        "misconceptions_detected": {"0": "alloy_is_pure", "2": "alloy_is_plastic", "3": "alloy_is_nonmetal"}
    },
    {
        "domain_slug": "materials-science",
        "tier": 1,
        "stem": "Which property measures a material's resistance to permanent (plastic) deformation or scratching?",
        "options": [
            {"text": "Toughness", "tag": "misconception_toughness"},
            {"text": "Ductility", "tag": "misconception_ductility"},
            {"text": "Hardness", "tag": "correct"},
            {"text": "Density", "tag": "misconception_density"}
        ],
        "correct_index": 2,
        "concepts_tested": ["mechanical_properties", "hardness"],
        "misconceptions_detected": {"0": "hardness_is_toughness", "1": "hardness_is_ductility", "3": "hardness_is_density"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "materials-science",
        "tier": 2,
        "stem": "How do 'dislocations' affect the mechanical properties of a metal?",
        "options": [
            {"text": "They act as microscopic cracks that make the metal instantly shatter", "tag": "misconception_fracture_mechanics"},
            {"text": "The movement of these 1D line defects through the crystal lattice is the primary mechanism of plastic (permanent) deformation in metals", "tag": "correct"},
            {"text": "They prevent electricity from flowing through the metal", "tag": "misconception_insulator"},
            {"text": "They turn the metal into a liquid at room temperature", "tag": "misconception_melting"}
        ],
        "correct_index": 1,
        "concepts_tested": ["defects", "dislocations", "plastic_deformation"],
        "misconceptions_detected": {"0": "dislocation_is_crack", "2": "dislocation_stops_conductivity", "3": "dislocation_melts_metal"}
    },
    {
        "domain_slug": "materials-science",
        "tier": 2,
        "stem": "What is the key structural difference between a thermoplastic and a thermosetting polymer?",
        "options": [
            {"text": "Thermoplastics contain carbon; thermosets do not", "tag": "misconception_organic"},
            {"text": "Thermoplastics consist of independent polymer chains that can be repeatedly melted and reshaped; thermosets form heavily cross-linked 3D networks that degrade/burn when heated", "tag": "correct"},
            {"text": "Thermoplastics are always transparent; thermosets are always opaque", "tag": "misconception_optical"},
            {"text": "Thermoplastics are electrically conductive; thermosets are insulators", "tag": "misconception_conductivity"}
        ],
        "correct_index": 1,
        "concepts_tested": ["polymers", "thermoplastics", "thermosets"],
        "misconceptions_detected": {"0": "polymer_carbon_myth", "2": "optical_properties_define_polymers", "3": "conductivity_defines_polymers"}
    },
    {
        "domain_slug": "materials-science",
        "tier": 2,
        "stem": "In materials science, what is 'fatigue'?",
        "options": [
            {"text": "The weakening and eventual failure of a material caused by repeated, cyclic loading, even if the stress is below the material's yield strength", "tag": "correct"},
            {"text": "The softening of a metal when heated to extreme temperatures", "tag": "misconception_creep"},
            {"text": "The chemical degradation of a metal due to environmental exposure", "tag": "misconception_corrosion"},
            {"text": "When a material suddenly becomes brittle in cold temperatures", "tag": "misconception_ductile_brittle_transition"}
        ],
        "correct_index": 0,
        "concepts_tested": ["mechanical_failure", "fatigue"],
        "misconceptions_detected": {"1": "fatigue_is_creep", "2": "fatigue_is_corrosion", "3": "fatigue_is_temperature_transition"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "materials-science",
        "tier": 3,
        "stem": "You are reading an iron-carbon phase diagram. What is the 'eutectoid' reaction in steel?",
        "options": [
            {"text": "Liquid iron freezing completely into solid austenite", "tag": "misconception_solidification"},
            {"text": "Solid austenite (FCC) transforming directly into a two-phase mixture of ferrite (BCC) and cementite (Fe3C) upon cooling, known as pearlite", "tag": "correct"},
            {"text": "The point where steel vaporizes into gas", "tag": "misconception_vaporization"},
            {"text": "The process of adding chromium to make stainless steel", "tag": "misconception_alloying"}
        ],
        "correct_index": 1,
        "concepts_tested": ["phase_diagrams", "metallurgy", "steel"],
        "misconceptions_detected": {"0": "eutectoid_is_freezing", "2": "eutectoid_is_boiling", "3": "eutectoid_is_alloying_process"}
    },
    {
        "domain_slug": "materials-science",
        "tier": 3,
        "stem": "What is 'precipitation hardening' (age hardening) in alloys like aerospace aluminum?",
        "options": [
            {"text": "Hammering the metal repeatedly while it is cold", "tag": "misconception_work_hardening"},
            {"text": "Heating the alloy, rapidly quenching it to supersaturate a solid solution, then aging it to allow tiny, uniformly dispersed particles to form and impede dislocation movement", "tag": "correct"},
            {"text": "Coating the outside of the metal with a hard ceramic layer", "tag": "misconception_case_hardening"},
            {"text": "Adding large amounts of carbon to create martensite", "tag": "misconception_martensitic_transformation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["heat_treatment", "strengthening_mechanisms", "precipitation_hardening"],
        "misconceptions_detected": {"0": "precipitation_is_work_hardening", "2": "precipitation_is_surface_coating", "3": "precipitation_is_steel_quenching"}
    },
    {
        "domain_slug": "materials-science",
        "tier": 3,
        "stem": "In fracture mechanics, what role does a 'stress concentrator' (like a sharp notch or internal microcrack) play in brittle materials?",
        "options": [
            {"text": "It acts as a shock absorber, increasing the material's toughness", "tag": "misconception_toughness_increase"},
            {"text": "It locally amplifies the applied stress far beyond the nominal average stress, often leading to catastrophic crack propagation at low loads", "tag": "correct"},
            {"text": "It safely redirects stress away from the main body of the part", "tag": "misconception_stress_redirection"},
            {"text": "It only affects the material if it is heated above its melting point", "tag": "misconception_temperature_dependent"}
        ],
        "correct_index": 1,
        "concepts_tested": ["fracture_mechanics", "stress_concentration"],
        "misconceptions_detected": {"0": "notch_increases_toughness", "2": "notch_redirects_stress_safely", "3": "notch_only_matters_hot"}
    },

    # =========================================================================
    # DOMAIN: economics-micro (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "economics-micro",
        "tier": 1,
        "stem": "The fundamental economic problem of 'Scarcity' means that:",
        "options": [
            {"text": "There is never enough money to pay for government programs", "tag": "misconception_budget_deficit"},
            {"text": "Society has unlimited wants but limited resources to fulfill them", "tag": "correct"},
            {"text": "Poor countries do not have enough food", "tag": "misconception_poverty_only"},
            {"text": "Businesses are intentionally hoarding goods to raise prices", "tag": "misconception_hoarding"}
        ],
        "correct_index": 1,
        "concepts_tested": ["scarcity", "economic_fundamentals"],
        "misconceptions_detected": {"0": "scarcity_is_government_budget", "2": "scarcity_is_only_poverty", "3": "scarcity_is_hoarding"}
    },
    {
        "domain_slug": "economics-micro",
        "tier": 1,
        "stem": "What does the 'Law of Demand' state, assuming all else is equal?",
        "options": [
            {"text": "As the price of a good increases, the quantity demanded increases", "tag": "misconception_positive_correlation"},
            {"text": "As the price of a good increases, the quantity demanded decreases", "tag": "correct"},
            {"text": "Demand is determined solely by consumer income", "tag": "misconception_income_only"},
            {"text": "Supply and demand are always perfectly equal", "tag": "misconception_always_equilibrium"}
        ],
        "correct_index": 1,
        "concepts_tested": ["supply_and_demand", "law_of_demand"],
        "misconceptions_detected": {"0": "price_and_demand_move_together", "2": "price_doesnt_affect_demand", "3": "markets_always_in_equilibrium"}
    },
    {
        "domain_slug": "economics-micro",
        "tier": 1,
        "stem": "What is an 'Opportunity Cost'?",
        "options": [
            {"text": "The monetary price you pay at the cash register", "tag": "misconception_accounting_cost"},
            {"text": "The value of the next best alternative that you must give up when making a choice", "tag": "correct"},
            {"text": "The cost of taking advantage of a bad situation", "tag": "misconception_predatory_pricing"},
            {"text": "A cost that has already been incurred and cannot be recovered", "tag": "misconception_sunk_cost"}
        ],
        "correct_index": 1,
        "concepts_tested": ["opportunity_cost", "decision_making"],
        "misconceptions_detected": {"0": "opportunity_cost_is_price", "2": "opportunity_cost_is_exploitation", "3": "opportunity_cost_is_sunk_cost"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "economics-micro",
        "tier": 2,
        "stem": "If the Price Elasticity of Demand for a medication is extremely 'inelastic' (e.g., elasticity < 1), what happens if the manufacturer doubles the price?",
        "options": [
            {"text": "Consumers will buy exactly half as much", "tag": "misconception_unit_elastic"},
            {"text": "Quantity demanded will drop slightly, but total revenue will increase significantly", "tag": "correct"},
            {"text": "Quantity demanded will drop to zero immediately", "tag": "misconception_perfectly_elastic"},
            {"text": "Total revenue for the manufacturer will decrease", "tag": "misconception_revenue_decrease"}
        ],
        "correct_index": 1,
        "concepts_tested": ["elasticity", "pricing_strategy"],
        "misconceptions_detected": {"0": "inelastic_is_unit_elastic", "2": "inelastic_is_perfectly_elastic", "3": "price_hikes_always_lower_revenue"}
    },
    {
        "domain_slug": "economics-micro",
        "tier": 2,
        "stem": "What characterizes a 'Perfectly Competitive' market?",
        "options": [
            {"text": "A few large firms aggressively advertising against each other", "tag": "misconception_oligopoly"},
            {"text": "One firm controls the entire market with a unique product", "tag": "misconception_monopoly"},
            {"text": "Many small buyers and sellers trading identical products, with no single firm able to influence the market price", "tag": "correct"},
            {"text": "Firms colluding secretly to keep prices artificially inflated", "tag": "misconception_cartel"}
        ],
        "correct_index": 2,
        "concepts_tested": ["market_structures", "perfect_competition"],
        "misconceptions_detected": {"0": "competition_means_oligopoly", "1": "competition_means_monopoly", "3": "competition_means_cartel"}
    },
    {
        "domain_slug": "economics-micro",
        "tier": 2,
        "stem": "In microeconomics, what is a 'Negative Externality'?",
        "options": [
            {"text": "When a company loses money and goes bankrupt", "tag": "misconception_business_failure"},
            {"text": "A cost that is suffered by a third party as a result of an economic transaction (e.g., factory pollution affecting nearby residents)", "tag": "correct"},
            {"text": "When consumers refuse to buy a product because of bad reviews", "tag": "misconception_consumer_boycott"},
            {"text": "A tax imposed by the government on imported goods", "tag": "misconception_tariff"}
        ],
        "correct_index": 1,
        "concepts_tested": ["market_failure", "externalities"],
        "misconceptions_detected": {"0": "externality_is_bankruptcy", "2": "externality_is_boycott", "3": "externality_is_tariff"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "economics-micro",
        "tier": 3,
        "stem": "A firm is trying to maximize its profits. According to marginal analysis, the firm should continue to produce additional units until:",
        "options": [
            {"text": "Total Revenue equals Total Cost", "tag": "misconception_break_even"},
            {"text": "Marginal Revenue (MR) is equal to Marginal Cost (MC)", "tag": "correct"},
            {"text": "Average Total Cost (ATC) is minimized", "tag": "misconception_min_atc"},
            {"text": "Marginal Revenue is zero", "tag": "misconception_revenue_max"}
        ],
        "correct_index": 1,
        "concepts_tested": ["profit_maximization", "marginal_analysis"],
        "misconceptions_detected": {"0": "profit_max_is_break_even", "2": "profit_max_is_min_atc", "3": "profit_max_is_revenue_max"}
    },
    {
        "domain_slug": "economics-micro",
        "tier": 3,
        "stem": "In Game Theory, the 'Prisoner's Dilemma' illustrates a scenario where:",
        "options": [
            {"text": "Two rational individuals will always figure out a way to cooperate for the best mutual outcome", "tag": "misconception_inevitable_cooperation"},
            {"text": "Rational, self-interested decision-making leads to a sub-optimal outcome for both parties because they cannot trust each other to cooperate", "tag": "correct"},
            {"text": "The government must step in to make decisions for individuals", "tag": "misconception_government_intervention"},
            {"text": "One person always wins everything and the other loses everything (zero-sum)", "tag": "misconception_zero_sum"}
        ],
        "correct_index": 1,
        "concepts_tested": ["game_theory", "prisoners_dilemma", "nash_equilibrium"],
        "misconceptions_detected": {"0": "rationality_guarantees_cooperation", "2": "dilemma_requires_government", "3": "dilemma_is_zero_sum"}
    },
    {
        "domain_slug": "economics-micro",
        "tier": 3,
        "stem": "If the government imposes an effective 'Price Ceiling' (a maximum legal price) on rent that is below the natural market equilibrium price, what is the standard microeconomic prediction?",
        "options": [
            {"text": "The quality and quantity of available rental housing will increase", "tag": "misconception_surplus"},
            {"text": "A shortage will occur because quantity demanded will exceed quantity supplied", "tag": "correct"},
            {"text": "The market will automatically adjust the equilibrium to match the ceiling exactly", "tag": "misconception_equilibrium_shift"},
            {"text": "Landlords will build more apartments to make up for the lost revenue", "tag": "misconception_supply_increase"}
        ],
        "correct_index": 1,
        "concepts_tested": ["price_controls", "shortages_and_surpluses"],
        "misconceptions_detected": {"0": "ceiling_causes_surplus", "2": "ceiling_shifts_equilibrium", "3": "ceiling_increases_supply"}
    },

    # =========================================================================
    # DOMAIN: marketing-fundamentals (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 1,
        "stem": "What is the primary definition of Marketing?",
        "options": [
            {"text": "Just another word for advertising and selling products", "tag": "misconception_marketing_is_advertising"},
            {"text": "The process of creating, communicating, delivering, and exchanging offerings that have value for customers, clients, partners, and society", "tag": "correct"},
            {"text": "Tricking consumers into buying things they don't need", "tag": "misconception_manipulation"},
            {"text": "Managing a company's social media accounts", "tag": "misconception_social_media_only"}
        ],
        "correct_index": 1,
        "concepts_tested": ["definition_of_marketing", "value_creation"],
        "misconceptions_detected": {"0": "marketing_equals_ads", "2": "marketing_is_evil", "3": "marketing_is_just_social_media"}
    },
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 1,
        "stem": "What are the classic '4 Ps' of the Marketing Mix?",
        "options": [
            {"text": "People, Process, Physical Evidence, Performance", "tag": "misconception_service_mix"},
            {"text": "Product, Price, Place, Promotion", "tag": "correct"},
            {"text": "Planning, Pitching, Publishing, Profit", "tag": "misconception_made_up_ps"},
            {"text": "Posters, Podcasts, PR, Pop-ups", "tag": "misconception_tactics"}
        ],
        "correct_index": 1,
        "concepts_tested": ["marketing_mix", "4_ps"],
        "misconceptions_detected": {"0": "confusing_extended_mix", "2": "made_up_framework", "3": "confusing_strategy_with_tactics"}
    },
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 1,
        "stem": "What is a 'Target Audience' or 'Target Market'?",
        "options": [
            {"text": "Everyone in the world who has money", "tag": "misconception_everyone"},
            {"text": "A specific, well-defined group of consumers that a company aims its products and marketing efforts toward", "tag": "correct"},
            {"text": "The competitors a company is trying to defeat", "tag": "misconception_competitors"},
            {"text": "The geographic location of a company's headquarters", "tag": "misconception_location"}
        ],
        "correct_index": 1,
        "concepts_tested": ["target_audience", "market_segmentation"],
        "misconceptions_detected": {"0": "target_is_everyone", "2": "target_is_competitor", "3": "target_is_hq"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 2,
        "stem": "What is 'Market Segmentation'?",
        "options": [
            {"text": "Dividing a broad target market into subsets of consumers who have common needs, interests, or priorities", "tag": "correct"},
            {"text": "Splitting the marketing budget evenly across all advertising channels", "tag": "misconception_budget_split"},
            {"text": "Breaking a large product into smaller pieces to sell it cheaper", "tag": "misconception_product_breakdown"},
            {"text": "Separating the marketing department from the sales department", "tag": "misconception_org_structure"}
        ],
        "correct_index": 0,
        "concepts_tested": ["segmentation", "consumer_behavior"],
        "misconceptions_detected": {"1": "segmentation_is_budgeting", "2": "segmentation_is_packaging", "3": "segmentation_is_org_chart"}
    },
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 2,
        "stem": "In branding, what is 'Brand Positioning'?",
        "options": [
            {"text": "The physical placement of a product on a supermarket shelf", "tag": "misconception_shelf_placement"},
            {"text": "Designing the company logo and choosing brand colors", "tag": "misconception_visual_identity"},
            {"text": "The space a brand occupies in the minds of the target customers relative to competing brands", "tag": "correct"},
            {"text": "Ranking #1 on Google search results", "tag": "misconception_seo"}
        ],
        "correct_index": 2,
        "concepts_tested": ["brand_positioning", "differentiation"],
        "misconceptions_detected": {"0": "positioning_is_physical", "1": "positioning_is_logo", "3": "positioning_is_seo"}
    },
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 2,
        "stem": "What is the difference between B2B and B2C marketing?",
        "options": [
            {"text": "B2B relies only on internet sales; B2C relies on physical stores", "tag": "misconception_channel_based"},
            {"text": "B2B (Business-to-Business) targets other companies for logic/ROI-driven purchases; B2C (Business-to-Consumer) targets individuals, often for emotional or personal use", "tag": "correct"},
            {"text": "B2B is for cheap products; B2C is for luxury products", "tag": "misconception_price_based"},
            {"text": "They are exactly the same in strategy, just different acronyms", "tag": "misconception_no_difference"}
        ],
        "correct_index": 1,
        "concepts_tested": ["b2b_vs_b2c", "target_markets"],
        "misconceptions_detected": {"0": "b2b_is_ecommerce", "2": "b2b_is_cheap", "3": "b2b_b2c_are_identical"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 3,
        "stem": "A company lowers the price of its software to $0 for a basic version, hoping users will eventually pay $15/month for premium features. This pricing strategy is called:",
        "options": [
            {"text": "Price Skimming", "tag": "misconception_skimming"},
            {"text": "Freemium", "tag": "correct"},
            {"text": "Penetration Pricing", "tag": "misconception_penetration"},
            {"text": "Predatory Pricing", "tag": "misconception_predatory"}
        ],
        "correct_index": 1,
        "concepts_tested": ["pricing_strategies", "freemium"],
        "misconceptions_detected": {"0": "freemium_is_skimming", "2": "freemium_is_penetration", "3": "freemium_is_illegal"}
    },
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 3,
        "stem": "In digital marketing, you launch an email campaign. 10,000 people open the email, and 500 people click the link inside. What is your Click-Through Rate (CTR) based on opens?",
        "options": [
            {"text": "0.5%", "tag": "misconception_bad_math"},
            {"text": "5%", "tag": "correct"},
            {"text": "50%", "tag": "misconception_bad_math2"},
            {"text": "500%", "tag": "misconception_impossible_ctr"}
        ],
        "correct_index": 1,
        "concepts_tested": ["marketing_metrics", "ctr", "digital_marketing"],
        "misconceptions_detected": {"0": "ctr_math_error_low", "2": "ctr_math_error_high", "3": "ctr_over_100"}
    },
    {
        "domain_slug": "marketing-fundamentals",
        "tier": 3,
        "stem": "You are doing a SWOT analysis for a local coffee shop. The opening of a large, corporate Starbucks directly across the street belongs in which category?",
        "options": [
            {"text": "Strengths", "tag": "misconception_strength"},
            {"text": "Weaknesses", "tag": "misconception_weakness"},
            {"text": "Opportunities", "tag": "misconception_opportunity"},
            {"text": "Threats", "tag": "correct"}
        ],
        "correct_index": 3,
        "concepts_tested": ["swot_analysis", "strategic_planning"],
        "misconceptions_detected": {"0": "competitor_is_strength", "1": "competitor_is_internal_weakness", "2": "competitor_is_opportunity"}
    },

    # =========================================================================
    # DOMAIN: sociology (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "sociology",
        "tier": 1,
        "stem": "What is the primary focus of Sociology as a discipline?",
        "options": [
            {"text": "The internal biological functions of the human brain", "tag": "misconception_biology"},
            {"text": "The study of individual mental illness and therapy", "tag": "misconception_psychology"},
            {"text": "The systematic study of human society, social structures, and social interaction", "tag": "correct"},
            {"text": "The excavation of ancient ruins to understand past civilizations", "tag": "misconception_archaeology"}
        ],
        "correct_index": 2,
        "concepts_tested": ["definition_of_sociology", "social_sciences"],
        "misconceptions_detected": {"0": "sociology_is_biology", "1": "sociology_is_psychology", "3": "sociology_is_archaeology"}
    },
    {
        "domain_slug": "sociology",
        "tier": 1,
        "stem": "In sociology, what are 'Social Norms'?",
        "options": [
            {"text": "Strict laws enforced by the police and court system", "tag": "misconception_laws"},
            {"text": "Unwritten rules and expectations by which a society guides the behavior of its members", "tag": "correct"},
            {"text": "Statistical averages of human height and weight", "tag": "misconception_statistics"},
            {"text": "People who act completely normal all the time", "tag": "misconception_literal_normal"}
        ],
        "correct_index": 1,
        "concepts_tested": ["culture", "social_norms"],
        "misconceptions_detected": {"0": "norms_are_formal_laws", "2": "norms_are_math_averages", "3": "norms_are_normal_people"}
    },
    {
        "domain_slug": "sociology",
        "tier": 1,
        "stem": "What does the term 'Socialization' refer to?",
        "options": [
            {"text": "Going out to parties and talking to friends", "tag": "misconception_socializing"},
            {"text": "The government taking control of private businesses (socialism)", "tag": "misconception_socialism"},
            {"text": "The lifelong process through which individuals learn and internalize the values, beliefs, and norms of their culture", "tag": "correct"},
            {"text": "The use of social media platforms like Instagram or X", "tag": "misconception_social_media"}
        ],
        "correct_index": 2,
        "concepts_tested": ["socialization", "development"],
        "misconceptions_detected": {"0": "socialization_is_partying", "1": "socialization_is_socialism", "3": "socialization_is_social_media"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "sociology",
        "tier": 2,
        "stem": "Which sociological perspective (paradigm) views society as a complex system whose parts work together to promote solidarity and stability, much like organs in a body?",
        "options": [
            {"text": "Conflict Theory", "tag": "misconception_conflict"},
            {"text": "Structural Functionalism", "tag": "correct"},
            {"text": "Symbolic Interactionism", "tag": "misconception_symbolic"},
            {"text": "Postmodernism", "tag": "misconception_postmodernism"}
        ],
        "correct_index": 1,
        "concepts_tested": ["sociological_paradigms", "functionalism"],
        "misconceptions_detected": {"0": "functionalism_is_conflict", "2": "functionalism_is_symbolic", "3": "functionalism_is_postmodern"}
    },
    {
        "domain_slug": "sociology",
        "tier": 2,
        "stem": "What is 'Social Stratification'?",
        "options": [
            {"text": "The way geologists study layers of rock", "tag": "misconception_geology"},
            {"text": "A society's categorization of its people into rankings of socioeconomic tiers based on factors like wealth, income, race, education, and power", "tag": "correct"},
            {"text": "The process of moving from a rural farm to a large city", "tag": "misconception_urbanization"},
            {"text": "When everyone in a society shares exactly equal amounts of wealth", "tag": "misconception_egalitarianism"}
        ],
        "correct_index": 1,
        "concepts_tested": ["social_stratification", "inequality"],
        "misconceptions_detected": {"0": "stratification_is_geology", "2": "stratification_is_urbanization", "3": "stratification_is_equality"}
    },
    {
        "domain_slug": "sociology",
        "tier": 2,
        "stem": "According to Karl Marx (Conflict Theory), the core struggle in capitalist societies is between:",
        "options": [
            {"text": "Men and women", "tag": "misconception_feminism"},
            {"text": "The Bourgeoisie (owners of the means of production) and the Proletariat (the working class)", "tag": "correct"},
            {"text": "Different religious institutions", "tag": "misconception_religion"},
            {"text": "The government and the military", "tag": "misconception_military"}
        ],
        "correct_index": 1,
        "concepts_tested": ["conflict_theory", "marxism", "class_struggle"],
        "misconceptions_detected": {"0": "marx_is_gender", "2": "marx_is_religion", "3": "marx_is_military"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "sociology",
        "tier": 3,
        "stem": "C. Wright Mills coined the term 'The Sociological Imagination'. What does this allow a person to do?",
        "options": [
            {"text": "To connect personal, individual troubles (like losing a job) to broader, societal public issues (like an economic recession)", "tag": "correct"},
            {"text": "To invent fictional societies in science fiction novels", "tag": "misconception_fiction"},
            {"text": "To accurately predict the future behavior of any individual", "tag": "misconception_prediction"},
            {"text": "To ignore social rules and live entirely independently", "tag": "misconception_anarchy"}
        ],
        "correct_index": 0,
        "concepts_tested": ["sociological_imagination", "mills"],
        "misconceptions_detected": {"1": "imagination_is_fiction", "2": "imagination_is_clairvoyance", "3": "imagination_is_anarchy"}
    },
    {
        "domain_slug": "sociology",
        "tier": 3,
        "stem": "If a doctor is expected to be compassionate with patients but also objective and detached when giving difficult diagnoses, they might experience:",
        "options": [
            {"text": "Role Strain", "tag": "correct"},
            {"text": "Status Inconsistency", "tag": "misconception_status_inconsistency"},
            {"text": "Cultural Lag", "tag": "misconception_cultural_lag"},
            {"text": "Ethnocentrism", "tag": "misconception_ethnocentrism"}
        ],
        "correct_index": 0,
        "concepts_tested": ["roles_and_status", "role_strain", "micro_sociology"],
        "misconceptions_detected": {"1": "strain_is_inconsistency", "2": "strain_is_lag", "3": "strain_is_ethnocentrism"}
    },
    {
        "domain_slug": "sociology",
        "tier": 3,
        "stem": "In the context of race and ethnicity, what is 'Institutional Racism'?",
        "options": [
            {"text": "A single person saying a racial slur to another person", "tag": "misconception_interpersonal"},
            {"text": "Racism embedded in the laws, policies, and structures of social institutions (like redlining in housing or disparities in the justice system), often functioning without the conscious intent of individuals", "tag": "correct"},
            {"text": "A psychological condition where a person is irrationally afraid of other cultures", "tag": "misconception_phobia"},
            {"text": "The belief that all races are completely biologically identical", "tag": "misconception_biological_equality"}
        ],
        "correct_index": 1,
        "concepts_tested": ["race_and_ethnicity", "institutional_discrimination"],
        "misconceptions_detected": {"0": "institutional_is_interpersonal", "2": "racism_is_clinical_phobia", "3": "racism_is_equality"}
    },

    # =========================================================================
    # DOMAIN: history-world (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "history-world",
        "tier": 1,
        "stem": "The 'Agricultural Revolution' (Neolithic Revolution) marked a major turning point in human history because:",
        "options": [
            {"text": "It was the first time humans used stone tools", "tag": "misconception_paleolithic"},
            {"text": "Humans transitioned from nomadic hunter-gatherer lifestyles to settled farming communities", "tag": "correct"},
            {"text": "It led to the invention of the steam engine", "tag": "misconception_industrial_revolution"},
            {"text": "It was when humans first learned to control fire", "tag": "misconception_fire"}
        ],
        "correct_index": 1,
        "concepts_tested": ["neolithic_revolution", "early_human_history"],
        "misconceptions_detected": {"0": "neolithic_is_paleolithic", "2": "neolithic_is_industrial", "3": "neolithic_is_fire"}
    },
    {
        "domain_slug": "history-world",
        "tier": 1,
        "stem": "What was the 'Silk Road'?",
        "options": [
            {"text": "A paved highway built by the Roman Empire", "tag": "misconception_roman_road"},
            {"text": "A famous sea route connecting Europe to the Americas", "tag": "misconception_columbian_exchange"},
            {"text": "A vast network of Eurasian trade routes connecting East Asia with the Middle East and Europe", "tag": "correct"},
            {"text": "A specific street in ancient China where silk was invented", "tag": "misconception_literal_street"}
        ],
        "correct_index": 2,
        "concepts_tested": ["silk_road", "trade_networks", "ancient_history"],
        "misconceptions_detected": {"0": "silk_road_is_roman", "1": "silk_road_is_atlantic", "3": "silk_road_is_one_street"}
    },
    {
        "domain_slug": "history-world",
        "tier": 1,
        "stem": "Which event is generally considered the start of World War II in Europe (1939)?",
        "options": [
            {"text": "The assassination of Archduke Franz Ferdinand", "tag": "misconception_ww1"},
            {"text": "The Japanese attack on Pearl Harbor", "tag": "misconception_pacific_theater"},
            {"text": "The dropping of the atomic bombs on Japan", "tag": "misconception_end_of_ww2"},
            {"text": "The invasion of Poland by Nazi Germany", "tag": "correct"}
        ],
        "correct_index": 3,
        "concepts_tested": ["world_war_2", "modern_history"],
        "misconceptions_detected": {"0": "ww2_started_like_ww1", "1": "ww2_started_at_pearl_harbor", "2": "ww2_started_with_nukes"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "history-world",
        "tier": 2,
        "stem": "The 'Columbian Exchange' (following 1492) refers to:",
        "options": [
            {"text": "The trade of purely digital information across the Atlantic", "tag": "misconception_modern"},
            {"text": "The widespread transfer of plants, animals, culture, human populations (including slaves), technology, and diseases between the Americas, West Africa, and the Old World", "tag": "correct"},
            {"text": "A peace treaty between indigenous American tribes and European settlers", "tag": "misconception_treaty"},
            {"text": "The establishment of the first banks in South America", "tag": "misconception_banking"}
        ],
        "correct_index": 1,
        "concepts_tested": ["columbian_exchange", "age_of_discovery"],
        "misconceptions_detected": {"0": "exchange_is_internet", "2": "exchange_is_peace_treaty", "3": "exchange_is_banking"}
    },
    {
        "domain_slug": "history-world",
        "tier": 2,
        "stem": "What was a primary cause of the French Revolution (1789)?",
        "options": [
            {"text": "An invasion by the British Empire", "tag": "misconception_foreign_invasion"},
            {"text": "A desire to establish a communist state", "tag": "misconception_russian_revolution"},
            {"text": "Severe social inequality, heavy taxation on the lower classes (Third Estate), and a financial crisis caused by royal extravagance and war debts", "tag": "correct"},
            {"text": "The assassination of King Louis XVI by an anarchist", "tag": "misconception_assassination"}
        ],
        "correct_index": 2,
        "concepts_tested": ["french_revolution", "european_history"],
        "misconceptions_detected": {"0": "french_rev_was_defense", "1": "french_rev_was_communist", "3": "french_rev_started_with_assassination"}
    },
    {
        "domain_slug": "history-world",
        "tier": 2,
        "stem": "During the Cold War, what did the term 'Proxy War' mean?",
        "options": [
            {"text": "A war fought entirely in cyberspace", "tag": "misconception_cyber_war"},
            {"text": "A direct nuclear conflict between the US and the USSR", "tag": "misconception_direct_conflict"},
            {"text": "A conflict where two opposing superpowers (US and USSR) support combatants in other countries (like Korea or Vietnam) without directly fighting each other", "tag": "correct"},
            {"text": "A war fought over control of internet proxy servers", "tag": "misconception_internet_proxy"}
        ],
        "correct_index": 2,
        "concepts_tested": ["cold_war", "proxy_wars", "20th_century_history"],
        "misconceptions_detected": {"0": "proxy_is_cyber", "1": "proxy_is_direct_nuke", "3": "proxy_is_IT"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "history-world",
        "tier": 3,
        "stem": "How did the printing press (invented by Gutenberg around 1440) directly influence the Protestant Reformation?",
        "options": [
            {"text": "It allowed the Pope to mass-produce indulgences to raise money quickly", "tag": "misconception_catholic_tool"},
            {"text": "It enabled the rapid, widespread copying and distribution of Martin Luther's '95 Theses' and translated Bibles, breaking the Catholic Church's monopoly on information", "tag": "correct"},
            {"text": "It was used to forge documents proving that the Roman Empire never fell", "tag": "misconception_forgery"},
            {"text": "It provided the physical metal needed to cast cannons for the religious wars", "tag": "misconception_military_use"}
        ],
        "correct_index": 1,
        "concepts_tested": ["reformation", "printing_press", "renaissance"],
        "misconceptions_detected": {"0": "press_caused_indulgences", "2": "press_used_for_roman_forgery", "3": "press_was_weaponry"}
    },
    {
        "domain_slug": "history-world",
        "tier": 3,
        "stem": "The 'Mandate of Heaven' in ancient Chinese philosophy was used primarily to:",
        "options": [
            {"text": "Justify the overthrow of a corrupt or failing dynasty, claiming the gods had withdrawn their favor", "tag": "correct"},
            {"text": "Explain the movement of the planets and stars", "tag": "misconception_astronomy"},
            {"text": "Force peasants to build the Great Wall", "tag": "misconception_labor_draft"},
            {"text": "Establish a rigid caste system where people could never change their social class", "tag": "misconception_caste_system"}
        ],
        "correct_index": 0,
        "concepts_tested": ["chinese_history", "mandate_of_heaven", "political_philosophy"],
        "misconceptions_detected": {"1": "mandate_is_astronomy", "2": "mandate_built_wall", "3": "mandate_is_caste_system"}
    },
    {
        "domain_slug": "history-world",
        "tier": 3,
        "stem": "What was the economic rationale behind European 'Mercantilism' in the 16th-18th centuries?",
        "options": [
            {"text": "To promote free trade and eliminate all tariffs between nations", "tag": "misconception_free_trade"},
            {"text": "To ensure that workers owned the factories and shared profits equally", "tag": "misconception_socialism"},
            {"text": "To maximize a nation's wealth (gold/silver) by maximizing exports, minimizing imports, and exploiting colonies for raw materials and captive markets", "tag": "correct"},
            {"text": "To abandon physical currency and trade entirely using digital ledgers", "tag": "misconception_crypto"}
        ],
        "correct_index": 2,
        "concepts_tested": ["economic_history", "mercantilism", "colonialism"],
        "misconceptions_detected": {"0": "mercantilism_is_free_trade", "1": "mercantilism_is_socialism", "3": "mercantilism_is_crypto"}
    },

    # =========================================================================
    # DOMAIN: organic-chemistry (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "organic-chemistry",
        "tier": 1,
        "stem": "What is the defining characteristic of an 'organic' molecule in chemistry?",
        "options": [
            {"text": "It is grown without the use of synthetic pesticides", "tag": "misconception_agriculture"},
            {"text": "It contains carbon-hydrogen (C-H) bonds", "tag": "correct"},
            {"text": "It was extracted directly from a living organism", "tag": "misconception_vitalism"},
            {"text": "It dissolves easily in water", "tag": "misconception_solubility"}
        ],
        "correct_index": 1,
        "concepts_tested": ["organic_compounds", "carbon_chemistry"],
        "misconceptions_detected": {"0": "organic_means_pesticide_free", "2": "vitalism_theory", "3": "organic_means_water_soluble"}
    },
    {
        "domain_slug": "organic-chemistry",
        "tier": 1,
        "stem": "Alkanes, alkenes, and alkynes are types of hydrocarbons. What distinguishes an alkene?",
        "options": [
            {"text": "It contains only single carbon-carbon bonds", "tag": "misconception_alkane"},
            {"text": "It contains at least one triple carbon-carbon bond", "tag": "misconception_alkyne"},
            {"text": "It contains at least one double carbon-carbon bond", "tag": "correct"},
            {"text": "It contains a benzene ring", "tag": "misconception_aromatic"}
        ],
        "correct_index": 2,
        "concepts_tested": ["hydrocarbons", "functional_groups", "alkenes"],
        "misconceptions_detected": {"0": "alkene_is_alkane", "1": "alkene_is_alkyne", "3": "alkene_is_aromatic"}
    },
    {
        "domain_slug": "organic-chemistry",
        "tier": 1,
        "stem": "What is a 'functional group' in organic chemistry?",
        "options": [
            {"text": "A specific arrangement of atoms responsible for the characteristic chemical reactions of a molecule", "tag": "correct"},
            {"text": "A group of scientists studying organic mechanisms", "tag": "misconception_literal_group"},
            {"text": "The longest continuous carbon chain in a molecule", "tag": "misconception_parent_chain"},
            {"text": "A molecule that functions as a catalyst", "tag": "misconception_catalyst"}
        ],
        "correct_index": 0,
        "concepts_tested": ["functional_groups", "molecular_structure"],
        "misconceptions_detected": {"1": "functional_group_is_people", "2": "functional_group_is_parent_chain", "3": "functional_group_is_catalyst"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "organic-chemistry",
        "tier": 2,
        "stem": "What is a 'chirality center' (or stereocenter) in a molecule?",
        "options": [
            {"text": "The center of mass of the entire molecule", "tag": "misconception_center_of_mass"},
            {"text": "A carbon atom bonded to four completely different groups, making its mirror image non-superimposable", "tag": "correct"},
            {"text": "A double bond that cannot rotate", "tag": "misconception_pi_bond"},
            {"text": "The atom with the highest electronegativity", "tag": "misconception_electronegativity"}
        ],
        "correct_index": 1,
        "concepts_tested": ["stereochemistry", "chirality", "enantiomers"],
        "misconceptions_detected": {"0": "chirality_is_mass_center", "2": "chirality_is_double_bond", "3": "chirality_is_electronegative_atom"}
    },
    {
        "domain_slug": "organic-chemistry",
        "tier": 2,
        "stem": "In a nucleophilic substitution reaction (like SN1 or SN2), what is the role of the 'leaving group'?",
        "options": [
            {"text": "It attacks the electron-deficient carbon", "tag": "misconception_nucleophile"},
            {"text": "It accepts electrons from the nucleophile", "tag": "misconception_electrophile"},
            {"text": "It takes a pair of electrons and departs from the main molecule, making room for the nucleophile", "tag": "correct"},
            {"text": "It acts as a solvent to speed up the reaction", "tag": "misconception_solvent"}
        ],
        "correct_index": 2,
        "concepts_tested": ["reaction_mechanisms", "nucleophilic_substitution", "leaving_groups"],
        "misconceptions_detected": {"0": "leaving_group_is_nucleophile", "1": "leaving_group_is_electrophile", "3": "leaving_group_is_solvent"}
    },
    {
        "domain_slug": "organic-chemistry",
        "tier": 2,
        "stem": "Why is benzene (C6H6) exceptionally stable compared to a typical alkene with three double bonds?",
        "options": [
            {"text": "Because it has a very large molecular weight", "tag": "misconception_molecular_weight"},
            {"text": "Because its pi electrons are delocalized evenly around the ring (aromaticity)", "tag": "correct"},
            {"text": "Because its carbon-carbon bonds are actually all single bonds", "tag": "misconception_all_single_bonds"},
            {"text": "Because it readily undergoes addition reactions", "tag": "misconception_addition_reactions"}
        ],
        "correct_index": 1,
        "concepts_tested": ["aromaticity", "benzene", "resonance"],
        "misconceptions_detected": {"0": "stability_from_weight", "2": "benzene_has_no_pi_bonds", "3": "benzene_does_addition"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "organic-chemistry",
        "tier": 3,
        "stem": "Comparing SN1 and SN2 reaction mechanisms: Which mechanism proceeds via a carbocation intermediate and results in a racemic mixture?",
        "options": [
            {"text": "SN1", "tag": "correct"},
            {"text": "SN2", "tag": "misconception_sn2_intermediate"},
            {"text": "Both proceed via a carbocation", "tag": "misconception_both_carbocation"},
            {"text": "Neither; E1 does", "tag": "misconception_e1_only"}
        ],
        "correct_index": 0,
        "concepts_tested": ["reaction_mechanisms", "sn1", "sn2", "stereochemistry"],
        "misconceptions_detected": {"1": "sn2_has_carbocation", "2": "sn2_is_stepwise", "3": "substitution_doesnt_use_carbocations"}
    },
    {
        "domain_slug": "organic-chemistry",
        "tier": 3,
        "stem": "You are analyzing an unknown liquid using Infrared (IR) Spectroscopy. You observe a broad, strong peak around 3300 cm^-1. What functional group is most likely present?",
        "options": [
            {"text": "A Carbonyl group (C=O)", "tag": "misconception_carbonyl"},
            {"text": "An Alkane (C-H stretch)", "tag": "misconception_alkane_stretch"},
            {"text": "A Hydroxyl group (O-H), indicating an alcohol or carboxylic acid", "tag": "correct"},
            {"text": "A Nitrile group (C\u2261N)", "tag": "misconception_nitrile"}
        ],
        "correct_index": 2,
        "concepts_tested": ["spectroscopy", "ir_spectroscopy", "functional_group_identification"],
        "misconceptions_detected": {"0": "carbonyl_is_3300", "1": "alkane_is_broad_3300", "3": "nitrile_is_3300"}
    },
    {
        "domain_slug": "organic-chemistry",
        "tier": 3,
        "stem": "In electrophilic aromatic substitution, what is the directing effect of a strongly activating group like an amino group (-NH2) on a benzene ring?",
        "options": [
            {"text": "Ortho/Para directing", "tag": "correct"},
            {"text": "Meta directing", "tag": "misconception_meta_directing"},
            {"text": "It completely prevents substitution", "tag": "misconception_deactivating"},
            {"text": "It directs substitution exclusively to the alkyl chain", "tag": "misconception_side_chain"}
        ],
        "correct_index": 0,
        "concepts_tested": ["electrophilic_aromatic_substitution", "directing_groups", "synthesis"],
        "misconceptions_detected": {"1": "activators_are_meta_directors", "2": "activators_stop_reactions", "3": "substitution_on_side_chain"}
    },

    # =========================================================================
    # DOMAIN: genetics (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "genetics",
        "tier": 1,
        "stem": "What is a 'gene'?",
        "options": [
            {"text": "The physical trait that you can see, like eye color", "tag": "misconception_phenotype"},
            {"text": "A segment of DNA that contains the instructions for making a specific protein or RNA molecule", "tag": "correct"},
            {"text": "The entire collection of DNA inside a cell", "tag": "misconception_genome"},
            {"text": "A disease passed down from parents to children", "tag": "misconception_disease_only"}
        ],
        "correct_index": 1,
        "concepts_tested": ["genes_and_dna", "molecular_biology"],
        "misconceptions_detected": {"0": "gene_is_phenotype", "2": "gene_is_genome", "3": "gene_is_disease"}
    },
    {
        "domain_slug": "genetics",
        "tier": 1,
        "stem": "In Mendelian genetics, what does it mean for an allele to be 'dominant'?",
        "options": [
            {"text": "It is the most common allele in the population", "tag": "misconception_population_frequency"},
            {"text": "It masks the expression of a recessive allele when both are present in an individual", "tag": "correct"},
            {"text": "It is passed down only from the father", "tag": "misconception_paternal_only"},
            {"text": "It makes the organism stronger and more likely to survive", "tag": "misconception_evolutionary_advantage"}
        ],
        "correct_index": 1,
        "concepts_tested": ["mendelian_genetics", "dominant_recessive"],
        "misconceptions_detected": {"0": "dominant_means_common", "2": "dominant_means_paternal", "3": "dominant_means_stronger"}
    },
    {
        "domain_slug": "genetics",
        "tier": 1,
        "stem": "What is a 'phenotype'?",
        "options": [
            {"text": "The specific sequence of DNA bases (A, C, T, G)", "tag": "misconception_genotype"},
            {"text": "The observable physical or biochemical characteristics of an organism, determined by its genetics and environment", "tag": "correct"},
            {"text": "A photograph of an individual's chromosomes", "tag": "misconception_karyotype"},
            {"text": "A type of genetic mutation", "tag": "misconception_mutation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["phenotype_genotype"],
        "misconceptions_detected": {"0": "phenotype_is_genotype", "2": "phenotype_is_karyotype", "3": "phenotype_is_mutation"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "genetics",
        "tier": 2,
        "stem": "What is the Central Dogma of Molecular Biology?",
        "options": [
            {"text": "DNA is converted into proteins directly, bypassing RNA", "tag": "misconception_direct_translation"},
            {"text": "Information flows from DNA to RNA (transcription), and then from RNA to protein (translation)", "tag": "correct"},
            {"text": "Proteins dictate the sequence of DNA", "tag": "misconception_reverse_flow"},
            {"text": "All genetic mutations are harmful", "tag": "misconception_all_mutations_bad"}
        ],
        "correct_index": 1,
        "concepts_tested": ["central_dogma", "transcription", "translation"],
        "misconceptions_detected": {"0": "no_rna_needed", "2": "proteins_make_dna", "3": "dogma_is_about_mutations"}
    },
    {
        "domain_slug": "genetics",
        "tier": 2,
        "stem": "What occurs during 'crossing over' in meiosis?",
        "options": [
            {"text": "Chromosomes replicate to double the amount of DNA", "tag": "misconception_replication"},
            {"text": "Homologous chromosomes exchange segments of DNA, increasing genetic diversity in the gametes", "tag": "correct"},
            {"text": "The cell membrane pinches to divide the cell in half", "tag": "misconception_cytokinesis"},
            {"text": "RNA polymerase reads the DNA to make mRNA", "tag": "misconception_transcription"}
        ],
        "correct_index": 1,
        "concepts_tested": ["meiosis", "genetic_recombination"],
        "misconceptions_detected": {"0": "crossing_over_is_replication", "2": "crossing_over_is_cytokinesis", "3": "crossing_over_is_transcription"}
    },
    {
        "domain_slug": "genetics",
        "tier": 2,
        "stem": "How is a 'sex-linked' (X-linked) recessive trait inherited?",
        "options": [
            {"text": "It affects males and females equally", "tag": "misconception_autosomal"},
            {"text": "It primarily affects males because they only have one X chromosome, so a single recessive allele causes the trait", "tag": "correct"},
            {"text": "It only affects females because they have two X chromosomes", "tag": "misconception_female_only"},
            {"text": "It is passed exclusively from father to son via the Y chromosome", "tag": "misconception_y_linked"}
        ],
        "correct_index": 1,
        "concepts_tested": ["inheritance_patterns", "sex_linked_traits"],
        "misconceptions_detected": {"0": "x_linked_is_autosomal", "2": "x_linked_recessive_favors_females", "3": "x_linked_is_y_linked"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "genetics",
        "tier": 3,
        "stem": "In a population in Hardy-Weinberg equilibrium, the frequency of the recessive allele (q) is 0.4. What percentage of the population is expected to be heterozygous (2pq)?",
        "options": [
            {"text": "16%", "tag": "misconception_q_squared"},
            {"text": "48%", "tag": "correct"},
            {"text": "36%", "tag": "misconception_p_squared"},
            {"text": "80%", "tag": "misconception_double_q"}
        ],
        "correct_index": 1,
        "concepts_tested": ["population_genetics", "hardy_weinberg"],
        "misconceptions_detected": {"0": "heterozygote_is_q2", "2": "heterozygote_is_p2", "3": "heterozygote_is_2q"}
    },
    {
        "domain_slug": "genetics",
        "tier": 3,
        "stem": "What is 'epigenetics'?",
        "options": [
            {"text": "The study of mutations that alter the DNA base sequence", "tag": "misconception_mutation_study"},
            {"text": "The study of changes in gene expression (turning genes on or off) that do not involve changes to the underlying DNA sequence (e.g., DNA methylation)", "tag": "correct"},
            {"text": "The process of extracting DNA from fossilized organisms", "tag": "misconception_paleogenetics"},
            {"text": "The genetic mapping of the entire human genome", "tag": "misconception_genomics"}
        ],
        "correct_index": 1,
        "concepts_tested": ["epigenetics", "gene_regulation"],
        "misconceptions_detected": {"0": "epigenetics_is_mutation", "2": "epigenetics_is_fossils", "3": "epigenetics_is_mapping"}
    },
    {
        "domain_slug": "genetics",
        "tier": 3,
        "stem": "How does CRISPR-Cas9 fundamentally work for gene editing?",
        "options": [
            {"text": "It uses a guide RNA to direct the Cas9 enzyme to cut DNA at a specific, targeted sequence, allowing researchers to add or remove genetic material", "tag": "correct"},
            {"text": "It injects synthetic proteins that physically block bad genes from being transcribed", "tag": "misconception_repressor_protein"},
            {"text": "It bombards the cell with radiation to induce random mutations until the desired trait appears", "tag": "misconception_radiation_mutagenesis"},
            {"text": "It uses a virus to replace the entire genome of the host organism", "tag": "misconception_genome_replacement"}
        ],
        "correct_index": 0,
        "concepts_tested": ["biotechnology", "crispr", "gene_editing"],
        "misconceptions_detected": {"1": "crispr_is_repressor", "2": "crispr_is_radiation", "3": "crispr_is_full_replacement"}
    },

    # =========================================================================
    # DOMAIN: quantum-mechanics (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "quantum-mechanics",
        "tier": 1,
        "stem": "What does the term 'quantum' fundamentally refer to in physics?",
        "options": [
            {"text": "Something extremely large and fast", "tag": "misconception_large_scale"},
            {"text": "A continuous flow of energy", "tag": "misconception_continuous"},
            {"text": "The smallest discrete, indivisible unit (or packet) of a physical property, like energy", "tag": "correct"},
            {"text": "A parallel universe", "tag": "misconception_multiverse"}
        ],
        "correct_index": 2,
        "concepts_tested": ["quantization", "basic_definitions"],
        "misconceptions_detected": {"0": "quantum_means_huge", "1": "quantum_is_continuous", "3": "quantum_is_multiverse"}
    },
    {
        "domain_slug": "quantum-mechanics",
        "tier": 1,
        "stem": "What is 'wave-particle duality'?",
        "options": [
            {"text": "The idea that particles exist in two places at once", "tag": "misconception_superposition_confusion"},
            {"text": "The concept that every particle or quantum entity can exhibit both wave-like and particle-like properties depending on how it is measured", "tag": "correct"},
            {"text": "The theory that waves and particles destroy each other on contact", "tag": "misconception_annihilation"},
            {"text": "The separation of light waves into different colors", "tag": "misconception_dispersion"}
        ],
        "correct_index": 1,
        "concepts_tested": ["wave_particle_duality", "double_slit"],
        "misconceptions_detected": {"0": "duality_is_superposition", "2": "duality_is_annihilation", "3": "duality_is_dispersion"}
    },
    {
        "domain_slug": "quantum-mechanics",
        "tier": 1,
        "stem": "Which famous principle states that it is impossible to simultaneously know both the exact position and the exact momentum of a particle?",
        "options": [
            {"text": "Einstein's Theory of Relativity", "tag": "misconception_relativity"},
            {"text": "Schrödinger's Cat Paradox", "tag": "misconception_schrodinger"},
            {"text": "Heisenberg's Uncertainty Principle", "tag": "correct"},
            {"text": "Pauli's Exclusion Principle", "tag": "misconception_pauli"}
        ],
        "correct_index": 2,
        "concepts_tested": ["uncertainty_principle", "heisenberg"],
        "misconceptions_detected": {"0": "uncertainty_is_relativity", "1": "uncertainty_is_cat", "3": "uncertainty_is_pauli"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "quantum-mechanics",
        "tier": 2,
        "stem": "In quantum mechanics, what does a 'wavefunction' describe?",
        "options": [
            {"text": "The physical path an electron takes as it orbits a nucleus like a planet", "tag": "misconception_bohr_orbit"},
            {"text": "A mathematical description whose square gives the probability of finding a particle in a particular state or location", "tag": "correct"},
            {"text": "The exact frequency of sound emitted by an atom", "tag": "misconception_acoustic_wave"},
            {"text": "The magnetic field generated by a moving electron", "tag": "misconception_magnetic_field"}
        ],
        "correct_index": 1,
        "concepts_tested": ["wavefunction", "probability_density", "born_rule"],
        "misconceptions_detected": {"0": "wavefunction_is_orbit", "2": "wavefunction_is_sound", "3": "wavefunction_is_magnetism"}
    },
    {
        "domain_slug": "quantum-mechanics",
        "tier": 2,
        "stem": "What does 'quantum superposition' imply?",
        "options": [
            {"text": "Two particles stacked on top of each other", "tag": "misconception_physical_stacking"},
            {"text": "A quantum system exists in a combination (linear combination) of all its possible states simultaneously until it is measured or observed", "tag": "correct"},
            {"text": "A particle traveling faster than the speed of light", "tag": "misconception_ftl"},
            {"text": "The ability of an atom to completely absorb another atom", "tag": "misconception_fusion"}
        ],
        "correct_index": 1,
        "concepts_tested": ["superposition", "measurement_problem"],
        "misconceptions_detected": {"0": "superposition_is_stacking", "2": "superposition_is_ftl", "3": "superposition_is_fusion"}
    },
    {
        "domain_slug": "quantum-mechanics",
        "tier": 2,
        "stem": "What is 'quantum entanglement'?",
        "options": [
            {"text": "A phenomenon where particles become physically tied together like knots", "tag": "misconception_knots"},
            {"text": "A condition where multiple particles share a quantum state such that the measurement of one instantly determines the state of the others, regardless of distance", "tag": "correct"},
            {"text": "The process by which particles lose their quantum properties and become classical", "tag": "misconception_decoherence"},
            {"text": "The slowing down of time near a black hole", "tag": "misconception_time_dilation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["entanglement", "non_locality"],
        "misconceptions_detected": {"0": "entanglement_is_physical_knot", "2": "entanglement_is_decoherence", "3": "entanglement_is_relativity"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "quantum-mechanics",
        "tier": 3,
        "stem": "What is the phenomenon of 'quantum tunneling'?",
        "options": [
            {"text": "A particle passing through a potential energy barrier that it classically does not have enough energy to overcome, due to the non-zero probability amplitude inside the barrier", "tag": "correct"},
            {"text": "The creation of miniature wormholes connecting different parts of the universe", "tag": "misconception_wormholes"},
            {"text": "Electrons traveling through a vacuum tube", "tag": "misconception_vacuum_tube"},
            {"text": "The absorption of a photon causing an electron to jump to a higher energy level", "tag": "misconception_excitation"}
        ],
        "correct_index": 0,
        "concepts_tested": ["quantum_tunneling", "wavefunction_penetration"],
        "misconceptions_detected": {"1": "tunneling_is_wormhole", "2": "tunneling_is_vacuum_tube", "3": "tunneling_is_excitation"}
    },
    {
        "domain_slug": "quantum-mechanics",
        "tier": 3,
        "stem": "In the context of quantum computing, how does a 'qubit' differ from a classical 'bit'?",
        "options": [
            {"text": "A qubit is just a much smaller, faster classical bit made of silicon", "tag": "misconception_smaller_bit"},
            {"text": "A classical bit is 0 or 1, while a qubit can exist in a superposition of 0 and 1, allowing for massively parallel computations", "tag": "correct"},
            {"text": "A qubit uses ternary logic (0, 1, and 2) instead of binary", "tag": "misconception_ternary"},
            {"text": "A qubit is a bit that has been cooled to absolute zero", "tag": "misconception_cold_bit"}
        ],
        "correct_index": 1,
        "concepts_tested": ["quantum_computing", "qubits", "superposition_application"],
        "misconceptions_detected": {"0": "qubit_is_fast_bit", "2": "qubit_is_ternary", "3": "qubit_is_cold_bit"}
    },
    {
        "domain_slug": "quantum-mechanics",
        "tier": 3,
        "stem": "The Pauli Exclusion Principle dictates the structure of the periodic table by stating that:",
        "options": [
            {"text": "Heavy elements are inherently unstable and will undergo radioactive decay", "tag": "misconception_radioactivity"},
            {"text": "No two fermions (like electrons) in a single atom can share the exact same set of four quantum numbers", "tag": "correct"},
            {"text": "Bosons cannot occupy the same energy state, leading to Bose-Einstein condensation", "tag": "misconception_bosons"},
            {"text": "Energy cannot be transferred out of a closed quantum system", "tag": "misconception_conservation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["pauli_exclusion", "fermions", "atomic_structure"],
        "misconceptions_detected": {"0": "exclusion_is_decay", "2": "exclusion_applies_to_bosons", "3": "exclusion_is_conservation"}
    },

    # =========================================================================
    # DOMAIN: astronomy (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "astronomy",
        "tier": 1,
        "stem": "What is a 'light-year'?",
        "options": [
            {"text": "The time it takes for Earth to travel around the Sun", "tag": "misconception_time_unit"},
            {"text": "The distance that light travels in a vacuum in one Earth year", "tag": "correct"},
            {"text": "The speed of light (300,000 km/s)", "tag": "misconception_speed_unit"},
            {"text": "The time it takes for light from the Sun to reach Earth", "tag": "misconception_solar_travel_time"}
        ],
        "correct_index": 1,
        "concepts_tested": ["astronomical_distances", "light_year"],
        "misconceptions_detected": {"0": "light_year_is_time", "2": "light_year_is_speed", "3": "light_year_is_8_minutes"}
    },
    {
        "domain_slug": "astronomy",
        "tier": 1,
        "stem": "Why does Earth have seasons (summer, winter)?",
        "options": [
            {"text": "Because Earth's orbit is extremely elliptical, moving it closer to and further from the Sun", "tag": "misconception_elliptical_orbit"},
            {"text": "Because the Sun's energy output varies throughout the year", "tag": "misconception_solar_variation"},
            {"text": "Because Earth's axis of rotation is tilted relative to its orbital plane, causing varying sunlight angles and duration", "tag": "correct"},
            {"text": "Because of changes in the Moon's gravitational pull", "tag": "misconception_lunar_gravity"}
        ],
        "correct_index": 2,
        "concepts_tested": ["celestial_mechanics", "seasons", "axial_tilt"],
        "misconceptions_detected": {"0": "seasons_from_distance", "1": "seasons_from_solar_output", "3": "seasons_from_moon"}
    },
    {
        "domain_slug": "astronomy",
        "tier": 1,
        "stem": "What is the primary source of energy that makes stars (like our Sun) shine?",
        "options": [
            {"text": "Nuclear fission (splitting heavy atoms like uranium)", "tag": "misconception_fission"},
            {"text": "Nuclear fusion (combining light atoms like hydrogen into helium)", "tag": "correct"},
            {"text": "Combustion (burning gases in the presence of oxygen)", "tag": "misconception_combustion"},
            {"text": "Friction from the star spinning rapidly", "tag": "misconception_friction"}
        ],
        "correct_index": 1,
        "concepts_tested": ["stellar_astrophysics", "nuclear_fusion"],
        "misconceptions_detected": {"0": "stars_use_fission", "2": "stars_are_on_fire", "3": "stars_heated_by_friction"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "astronomy",
        "tier": 2,
        "stem": "How do astronomers determine the chemical composition of a distant star?",
        "options": [
            {"text": "By sending probes to collect physical samples of the star's outer layers", "tag": "misconception_physical_sampling"},
            {"text": "By analyzing the star's absorption or emission spectrum (spectroscopy) to find specific elemental signatures", "tag": "correct"},
            {"text": "By measuring the star's mass and volume to calculate its density", "tag": "misconception_density_composition"},
            {"text": "By observing the color of the planets orbiting it", "tag": "misconception_exoplanet_color"}
        ],
        "correct_index": 1,
        "concepts_tested": ["spectroscopy", "stellar_composition", "observational_astronomy"],
        "misconceptions_detected": {"0": "we_send_probes_to_stars", "2": "density_gives_exact_composition", "3": "planets_dictate_star_chemistry"}
    },
    {
        "domain_slug": "astronomy",
        "tier": 2,
        "stem": "What defines a 'black hole'?",
        "options": [
            {"text": "A physical hole in the fabric of space-time that leads to another universe", "tag": "misconception_wormhole"},
            {"text": "An empty void in space where no matter exists", "tag": "misconception_empty_void"},
            {"text": "An extremely dense region of space with a gravitational pull so strong that not even light can escape its event horizon", "tag": "correct"},
            {"text": "A star that has burned out and become entirely invisible but lacks gravity", "tag": "misconception_dead_star_no_gravity"}
        ],
        "correct_index": 2,
        "concepts_tested": ["black_holes", "gravity", "general_relativity"],
        "misconceptions_detected": {"0": "black_hole_is_wormhole", "1": "black_hole_is_empty", "3": "black_hole_lacks_gravity"}
    },
    {
        "domain_slug": "astronomy",
        "tier": 2,
        "stem": "What is the 'Cosmic Microwave Background' (CMB)?",
        "options": [
            {"text": "Interference caused by human satellites and radio towers", "tag": "misconception_human_interference"},
            {"text": "Relic radiation from the early universe, providing strong evidence for the Big Bang theory", "tag": "correct"},
            {"text": "The collective heat emitted by all active black holes in the galaxy", "tag": "misconception_black_hole_radiation"},
            {"text": "A cloud of microwave-emitting gas surrounding our solar system", "tag": "misconception_local_gas_cloud"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cosmology", "big_bang", "cmb"],
        "misconceptions_detected": {"0": "cmb_is_human_noise", "2": "cmb_is_black_holes", "3": "cmb_is_local"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "astronomy",
        "tier": 3,
        "stem": "Astronomers observe that the light from almost all distant galaxies is 'redshifted'. According to Hubble's Law, what does this imply?",
        "options": [
            {"text": "The galaxies are physically changing color as they age", "tag": "misconception_aging_color"},
            {"text": "The universe is expanding, causing the space between us and the galaxies to stretch, which stretches the wavelength of the light", "tag": "correct"},
            {"text": "The light is being slowed down by interstellar dust (tired light)", "tag": "misconception_tired_light"},
            {"text": "The galaxies are all moving toward a central point of gravity", "tag": "misconception_collapsing_universe"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cosmology", "hubbles_law", "redshift", "expansion_of_universe"],
        "misconceptions_detected": {"0": "redshift_is_temperature_drop", "2": "redshift_is_tired_light", "3": "redshift_means_collapse"}
    },
    {
        "domain_slug": "astronomy",
        "tier": 3,
        "stem": "In stellar evolution, what determines whether a dying star will become a white dwarf, a neutron star, or a black hole?",
        "options": [
            {"text": "Its initial mass", "tag": "correct"},
            {"text": "Its distance from the galactic center", "tag": "misconception_galactic_position"},
            {"text": "The number of planets orbiting it", "tag": "misconception_planetary_mass"},
            {"text": "Its rate of rotation", "tag": "misconception_rotation_rate"}
        ],
        "correct_index": 0,
        "concepts_tested": ["stellar_evolution", "chandrasekhar_limit", "tolman_oppenheimer_volkoff_limit"],
        "misconceptions_detected": {"1": "evolution_depends_on_galaxy", "2": "evolution_depends_on_planets", "3": "evolution_depends_on_spin"}
    },
    {
        "domain_slug": "astronomy",
        "tier": 3,
        "stem": "What is the primary difference between 'Dark Matter' and 'Dark Energy'?",
        "options": [
            {"text": "Dark matter accelerates the expansion of the universe; dark energy holds galaxies together", "tag": "misconception_reversed"},
            {"text": "Dark matter exerts gravitational pull holding galaxies together; dark energy exerts a repulsive force driving the accelerated expansion of the universe", "tag": "correct"},
            {"text": "They are exactly the same thing, just observed at different times", "tag": "misconception_synonyms"},
            {"text": "Dark matter is antimatter; dark energy is regular energy", "tag": "misconception_antimatter"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cosmology", "dark_matter", "dark_energy"],
        "misconceptions_detected": {"0": "reversed_dm_de", "2": "dm_de_are_same", "3": "dm_is_antimatter"}
    },

    # =========================================================================
    # DOMAIN: civil-engineering (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "civil-engineering",
        "tier": 1,
        "stem": "What is the primary purpose of 'reinforced concrete' compared to plain concrete?",
        "options": [
            {"text": "To make the concrete lighter and easier to transport", "tag": "misconception_weight_reduction"},
            {"text": "To add tensile strength (using steel rebar) because plain concrete is strong in compression but weak in tension", "tag": "correct"},
            {"text": "To prevent the concrete from drying too quickly", "tag": "misconception_curing"},
            {"text": "To increase the aesthetic appeal of the structure", "tag": "misconception_aesthetics"}
        ],
        "correct_index": 1,
        "concepts_tested": ["materials_science", "reinforced_concrete", "tension_compression"],
        "misconceptions_detected": {"0": "rebar_makes_it_lighter", "2": "rebar_controls_drying", "3": "rebar_is_decorative"}
    },
    {
        "domain_slug": "civil-engineering",
        "tier": 1,
        "stem": "In structural engineering, what is a 'dead load'?",
        "options": [
            {"text": "The weight of people and furniture moving around a building", "tag": "misconception_live_load"},
            {"text": "The permanent, stationary weight of the structure itself (e.g., walls, floors, roof)", "tag": "correct"},
            {"text": "The force exerted by wind or earthquakes", "tag": "misconception_environmental_load"},
            {"text": "A load that has caused a structural failure", "tag": "misconception_failure_load"}
        ],
        "correct_index": 1,
        "concepts_tested": ["structural_analysis", "load_types"],
        "misconceptions_detected": {"0": "dead_load_is_live_load", "2": "dead_load_is_environmental", "3": "dead_load_means_broken"}
    },
    {
        "domain_slug": "civil-engineering",
        "tier": 1,
        "stem": "What is 'surveying' in the context of civil engineering?",
        "options": [
            {"text": "Interviewing residents about proposed construction projects", "tag": "misconception_public_survey"},
            {"text": "The technique of determining the terrestrial or three-dimensional positions of points and the distances and angles between them (mapping land)", "tag": "correct"},
            {"text": "Inspecting a finished building for safety violations", "tag": "misconception_building_inspection"},
            {"text": "Estimating the total cost of construction materials", "tag": "misconception_cost_estimation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["surveying", "geomatics"],
        "misconceptions_detected": {"0": "surveying_is_polling", "2": "surveying_is_inspection", "3": "surveying_is_accounting"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "civil-engineering",
        "tier": 2,
        "stem": "Why do engineers use 'expansion joints' in long bridges or concrete slabs?",
        "options": [
            {"text": "To allow water to drain through the structure", "tag": "misconception_drainage"},
            {"text": "To allow the material to safely expand and contract with temperature changes without cracking or buckling", "tag": "correct"},
            {"text": "To reduce the amount of expensive materials needed", "tag": "misconception_cost_saving"},
            {"text": "To provide a visual marker for lane divisions", "tag": "misconception_lane_marker"}
        ],
        "correct_index": 1,
        "concepts_tested": ["thermal_expansion", "structural_design"],
        "misconceptions_detected": {"0": "joints_are_for_drainage", "2": "joints_save_money", "3": "joints_are_paint"}
    },
    {
        "domain_slug": "civil-engineering",
        "tier": 2,
        "stem": "In geotechnical engineering, what is 'soil liquefaction'?",
        "options": [
            {"text": "The process of mixing soil with water to make mud for construction", "tag": "misconception_mud_mixing"},
            {"text": "A phenomenon where saturated soil substantially loses strength and stiffness in response to an applied stress (like an earthquake), behaving like a liquid", "tag": "correct"},
            {"text": "The chemical breakdown of soil into its basic liquid elements", "tag": "misconception_chemical_breakdown"},
            {"text": "The natural process of soil turning into rock over millions of years", "tag": "misconception_lithification"}
        ],
        "correct_index": 1,
        "concepts_tested": ["geotechnical_engineering", "liquefaction", "seismic_hazards"],
        "misconceptions_detected": {"0": "liquefaction_is_mixing_mud", "2": "liquefaction_is_chemical", "3": "liquefaction_is_rock_formation"}
    },
    {
        "domain_slug": "civil-engineering",
        "tier": 2,
        "stem": "What is the primary function of a 'weir' in open channel flow (hydraulics)?",
        "options": [
            {"text": "To completely block a river and create a massive reservoir", "tag": "misconception_dam"},
            {"text": "To filter out solid debris from wastewater", "tag": "misconception_screen"},
            {"text": "A small barrier built across a stream to raise the water level slightly and measure or control the flow rate", "tag": "correct"},
            {"text": "To pump water uphill against gravity", "tag": "misconception_pump"}
        ],
        "correct_index": 2,
        "concepts_tested": ["hydraulics", "open_channel_flow", "weirs"],
        "misconceptions_detected": {"0": "weir_is_major_dam", "1": "weir_is_debris_filter", "3": "weir_is_pump"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "civil-engineering",
        "tier": 3,
        "stem": "When designing a simply supported beam subject to a uniform distributed load, where does the maximum bending moment occur?",
        "options": [
            {"text": "At the supports (ends of the beam)", "tag": "misconception_max_moment_at_supports"},
            {"text": "At the exact center (midspan) of the beam", "tag": "correct"},
            {"text": "It is uniform across the entire beam", "tag": "misconception_uniform_moment"},
            {"text": "At a distance of L/3 from either support", "tag": "misconception_third_point"}
        ],
        "correct_index": 1,
        "concepts_tested": ["structural_analysis", "bending_moments", "shear_and_moment_diagrams"],
        "misconceptions_detected": {"0": "moment_max_at_supports_simple", "2": "uniform_load_means_uniform_moment", "3": "moment_max_at_thirds"}
    },
    {
        "domain_slug": "civil-engineering",
        "tier": 3,
        "stem": "In transportation engineering, what is 'Level of Service' (LOS)?",
        "options": [
            {"text": "A measure of how quickly a construction project is completed", "tag": "misconception_project_speed"},
            {"text": "A qualitative grading scale (A through F) describing operating conditions within a traffic stream, such as speed, travel time, and congestion", "tag": "correct"},
            {"text": "The thickness of the asphalt pavement laid on a highway", "tag": "misconception_pavement_thickness"},
            {"text": "The amount of toll revenue collected per mile", "tag": "misconception_toll_revenue"}
        ],
        "correct_index": 1,
        "concepts_tested": ["transportation_engineering", "traffic_flow", "level_of_service"],
        "misconceptions_detected": {"0": "los_is_construction_time", "2": "los_is_asphalt_grade", "3": "los_is_revenue"}
    },
    {
        "domain_slug": "civil-engineering",
        "tier": 3,
        "stem": "In wastewater treatment, what happens during the 'Secondary Treatment' phase?",
        "options": [
            {"text": "Large solid objects (rags, plastics) are removed using physical screens", "tag": "misconception_primary_screening"},
            {"text": "Chemicals like chlorine or UV light are used to kill pathogens", "tag": "misconception_tertiary_disinfection"},
            {"text": "Biological processes (like activated sludge) use microorganisms to consume dissolved organic matter", "tag": "correct"},
            {"text": "The water is pumped into a river or ocean", "tag": "misconception_discharge"}
        ],
        "correct_index": 2,
        "concepts_tested": ["environmental_engineering", "wastewater_treatment", "biological_processes"],
        "misconceptions_detected": {"0": "secondary_is_screening", "1": "secondary_is_disinfection", "3": "secondary_is_discharge"}
    },

    # =========================================================================
    # DOMAIN: chemical-engineering (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "chemical-engineering",
        "tier": 1,
        "stem": "What is the core principle behind a 'mass balance' (or material balance) in a chemical process?",
        "options": [
            {"text": "Mass In = Mass Out + Accumulation (Law of Conservation of Mass)", "tag": "correct"},
            {"text": "The mass of reactants always equals the volume of products", "tag": "misconception_mass_equals_volume"},
            {"text": "Chemical reactions always reach 100% completion", "tag": "misconception_full_conversion"},
            {"text": "The total energy in the system remains constant", "tag": "misconception_energy_balance"}
        ],
        "correct_index": 0,
        "concepts_tested": ["mass_balance", "conservation_laws", "stoichiometry"],
        "misconceptions_detected": {"1": "mass_is_conserved_as_volume", "2": "balances_assume_100_yield", "3": "mass_balance_is_energy_balance"}
    },
    {
        "domain_slug": "chemical-engineering",
        "tier": 1,
        "stem": "What is the purpose of 'distillation' in chemical engineering?",
        "options": [
            {"text": "To filter solid particles out of a liquid", "tag": "misconception_filtration"},
            {"text": "To separate liquid mixtures based on differences in their boiling points (volatilities)", "tag": "correct"},
            {"text": "To crush raw materials into a fine powder", "tag": "misconception_milling"},
            {"text": "To chemically bond two inert gases together", "tag": "misconception_reaction"}
        ],
        "correct_index": 1,
        "concepts_tested": ["unit_operations", "separations", "distillation"],
        "misconceptions_detected": {"0": "distillation_is_filtration", "2": "distillation_is_crushing", "3": "distillation_is_chemical_reaction"}
    },
    {
        "domain_slug": "chemical-engineering",
        "tier": 1,
        "stem": "What does a 'catalyst' do in a chemical reactor?",
        "options": [
            {"text": "It is consumed completely to provide energy for the reaction", "tag": "misconception_catalyst_as_fuel"},
            {"text": "It lowers the activation energy, increasing the rate of reaction without being permanently consumed", "tag": "correct"},
            {"text": "It shifts the final thermodynamic equilibrium point to produce more product", "tag": "misconception_catalyst_shifts_equilibrium"},
            {"text": "It cools down the reactor to prevent explosions", "tag": "misconception_catalyst_as_coolant"}
        ],
        "correct_index": 1,
        "concepts_tested": ["catalysis", "reaction_kinetics"],
        "misconceptions_detected": {"0": "catalyst_is_fuel", "2": "catalyst_changes_equilibrium", "3": "catalyst_is_coolant"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "chemical-engineering",
        "tier": 2,
        "stem": "In fluid flow, what does the 'Reynolds number' indicate?",
        "options": [
            {"text": "The pressure drop across a pipe length", "tag": "misconception_pressure_drop"},
            {"text": "The ratio of inertial forces to viscous forces, determining whether flow is laminar or turbulent", "tag": "correct"},
            {"text": "The exact speed of the fluid in meters per second", "tag": "misconception_velocity"},
            {"text": "The efficiency of a centrifugal pump", "tag": "misconception_pump_efficiency"}
        ],
        "correct_index": 1,
        "concepts_tested": ["fluid_mechanics", "reynolds_number", "flow_regimes"],
        "misconceptions_detected": {"0": "reynolds_is_pressure", "2": "reynolds_is_velocity", "3": "reynolds_is_efficiency"}
    },
    {
        "domain_slug": "chemical-engineering",
        "tier": 2,
        "stem": "What is a CSTR (Continuous Stirred-Tank Reactor)?",
        "options": [
            {"text": "A reactor where reactants are added in a single batch, allowed to react, and then emptied", "tag": "misconception_batch_reactor"},
            {"text": "A long tube where reactants flow continuously and react as they move along the length", "tag": "misconception_plug_flow"},
            {"text": "A well-mixed tank with continuous inflow and outflow, where conditions are uniform throughout the vessel", "tag": "correct"},
            {"text": "A reactor specifically designed to burn solid waste", "tag": "misconception_incinerator"}
        ],
        "correct_index": 2,
        "concepts_tested": ["reactor_design", "cstr"],
        "misconceptions_detected": {"0": "cstr_is_batch", "1": "cstr_is_plug_flow", "3": "cstr_is_incinerator"}
    },
    {
        "domain_slug": "chemical-engineering",
        "tier": 2,
        "stem": "In a heat exchanger, what is 'counter-current flow'?",
        "options": [
            {"text": "Both the hot and cold fluids enter at the same end and flow in the same direction", "tag": "misconception_co_current"},
            {"text": "The hot and cold fluids flow in opposite directions, allowing for more efficient heat transfer", "tag": "correct"},
            {"text": "The fluids are mixed together directly to exchange heat", "tag": "misconception_direct_contact"},
            {"text": "The fluid flows perpendicular to the heating element", "tag": "misconception_cross_flow"}
        ],
        "correct_index": 1,
        "concepts_tested": ["heat_transfer", "heat_exchangers"],
        "misconceptions_detected": {"0": "counter_is_co_current", "2": "counter_is_mixing", "3": "counter_is_cross_flow"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "chemical-engineering",
        "tier": 3,
        "stem": "In distillation column design, what are 'McCabe-Thiele' diagrams used for?",
        "options": [
            {"text": "To determine the mechanical stress on the column walls", "tag": "misconception_mechanical_stress"},
            {"text": "To graphically determine the number of theoretical stages (trays) required to achieve a desired separation of a binary mixture", "tag": "correct"},
            {"text": "To calculate the heat capacity of the feed mixture", "tag": "misconception_heat_capacity"},
            {"text": "To predict the economic profitability of the plant", "tag": "misconception_economics"}
        ],
        "correct_index": 1,
        "concepts_tested": ["separations", "distillation_design", "mccabe_thiele"],
        "misconceptions_detected": {"0": "mccabe_thiele_is_mechanical", "2": "mccabe_thiele_is_thermodynamics", "3": "mccabe_thiele_is_economics"}
    },
    {
        "domain_slug": "chemical-engineering",
        "tier": 3,
        "stem": "What is an 'azeotrope' in the context of vapor-liquid equilibrium?",
        "options": [
            {"text": "A completely immiscible mixture (like oil and water)", "tag": "misconception_immiscible"},
            {"text": "A mixture of liquids that maintains the same composition in the liquid and vapor phase during boiling, preventing further separation by simple distillation", "tag": "correct"},
            {"text": "A theoretical liquid that has zero viscosity", "tag": "misconception_superfluid"},
            {"text": "A catalyst used specifically in polymerization", "tag": "misconception_catalyst"}
        ],
        "correct_index": 1,
        "concepts_tested": ["thermodynamics", "phase_equilibrium", "azeotropes"],
        "misconceptions_detected": {"0": "azeotrope_is_immiscible", "2": "azeotrope_is_superfluid", "3": "azeotrope_is_catalyst"}
    },
    {
        "domain_slug": "chemical-engineering",
        "tier": 3,
        "stem": "In process control, a PID controller is tuned to eliminate steady-state error. Which component of the PID controller is primarily responsible for bringing the error exactly to zero over time?",
        "options": [
            {"text": "Proportional (P)", "tag": "misconception_proportional"},
            {"text": "Derivative (D)", "tag": "misconception_derivative"},
            {"text": "Integral (I)", "tag": "correct"},
            {"text": "Feedforward", "tag": "misconception_feedforward"}
        ],
        "correct_index": 2,
        "concepts_tested": ["process_control", "pid_tuning"],
        "misconceptions_detected": {"0": "p_eliminates_offset", "1": "d_eliminates_offset", "3": "feedforward_is_integral"}
    },

    # =========================================================================
    # DOMAIN: electrical-engineering (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "electrical-engineering",
        "tier": 1,
        "stem": "Ohm's Law states the relationship between voltage (V), current (I), and resistance (R) as:",
        "options": [
            {"text": "V = I / R", "tag": "misconception_division"},
            {"text": "V = I * R", "tag": "correct"},
            {"text": "I = V * R", "tag": "misconception_current_product"},
            {"text": "R = V * I", "tag": "misconception_resistance_product"}
        ],
        "correct_index": 1,
        "concepts_tested": ["ohms_law", "circuit_basics"],
        "misconceptions_detected": {"0": "voltage_is_current_divided_by_resistance", "2": "current_is_voltage_times_resistance", "3": "resistance_is_power"}
    },
    {
        "domain_slug": "electrical-engineering",
        "tier": 1,
        "stem": "What is the primary function of a capacitor?",
        "options": [
            {"text": "To step up or step down AC voltage", "tag": "misconception_transformer"},
            {"text": "To allow current to flow in only one direction", "tag": "misconception_diode"},
            {"text": "To store and release electrical energy in an electric field", "tag": "correct"},
            {"text": "To restrict the flow of current and dissipate energy as heat", "tag": "misconception_resistor"}
        ],
        "correct_index": 2,
        "concepts_tested": ["capacitors", "energy_storage"],
        "misconceptions_detected": {"0": "capacitor_is_transformer", "1": "capacitor_is_diode", "3": "capacitor_is_resistor"}
    },
    {
        "domain_slug": "electrical-engineering",
        "tier": 1,
        "stem": "In an Alternating Current (AC) system, what does 'frequency' (measured in Hertz) represent?",
        "options": [
            {"text": "The speed at which electrons travel through the wire", "tag": "misconception_electron_speed"},
            {"text": "The maximum voltage amplitude of the waveform", "tag": "misconception_amplitude"},
            {"text": "The number of complete cycles the current reverses direction per second", "tag": "correct"},
            {"text": "The amount of power consumed by the load", "tag": "misconception_power"}
        ],
        "correct_index": 2,
        "concepts_tested": ["ac_circuits", "frequency"],
        "misconceptions_detected": {"0": "frequency_is_speed", "1": "frequency_is_voltage", "3": "frequency_is_power"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "electrical-engineering",
        "tier": 2,
        "stem": "According to Kirchhoff's Voltage Law (KVL), what is true about any closed loop in a circuit?",
        "options": [
            {"text": "The sum of currents entering a node equals the sum leaving it", "tag": "misconception_kcl"},
            {"text": "The total resistance is equal to the sum of individual resistances", "tag": "misconception_series_resistance"},
            {"text": "The algebraic sum of all voltages (potential differences) around the loop is zero", "tag": "correct"},
            {"text": "The voltage across parallel branches is inversely proportional to their resistance", "tag": "misconception_current_divider"}
        ],
        "correct_index": 2,
        "concepts_tested": ["kvl", "circuit_analysis"],
        "misconceptions_detected": {"0": "kvl_is_kcl", "1": "kvl_is_series_r", "3": "kvl_is_current_divider"}
    },
    {
        "domain_slug": "electrical-engineering",
        "tier": 2,
        "stem": "What is 'impedance' in an AC circuit?",
        "options": [
            {"text": "The total opposition to current flow, combining both resistance and reactance", "tag": "correct"},
            {"text": "The pure resistance measured when DC is applied", "tag": "misconception_dc_resistance"},
            {"text": "The rate at which power is lost as heat", "tag": "misconception_power_loss"},
            {"text": "The phase shift between voltage and current", "tag": "misconception_phase_angle"}
        ],
        "correct_index": 0,
        "concepts_tested": ["impedance", "ac_analysis"],
        "misconceptions_detected": {"1": "impedance_is_just_resistance", "2": "impedance_is_power_loss", "3": "impedance_is_phase"}
    },
    {
        "domain_slug": "electrical-engineering",
        "tier": 2,
        "stem": "How does a bipolar junction transistor (BJT) fundamentally operate in the active region?",
        "options": [
            {"text": "As a voltage-controlled voltage source", "tag": "misconception_mosfet"},
            {"text": "As a switch that completely blocks or passes current based on a magnetic field", "tag": "misconception_relay"},
            {"text": "As a current-controlled current source, where a small base current controls a larger collector current", "tag": "correct"},
            {"text": "As a passive component that filters out upper frequencies", "tag": "misconception_filter"}
        ],
        "correct_index": 2,
        "concepts_tested": ["transistors", "electronics"],
        "misconceptions_detected": {"0": "bjt_is_voltage_controlled", "1": "bjt_is_relay", "3": "bjt_is_passive_filter"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "electrical-engineering",
        "tier": 3,
        "stem": "You are designing an active low-pass filter using an operational amplifier. The cutoff frequency is lower than expected. What component change would fix this?",
        "options": [
            {"text": "Increase the supply voltage of the op-amp", "tag": "misconception_supply_voltage"},
            {"text": "Decrease the value of the feedback resistor or capacitor", "tag": "correct"},
            {"text": "Increase the input signal amplitude", "tag": "misconception_amplitude"},
            {"text": "Change the op-amp to a model with a higher slew rate", "tag": "misconception_slew_rate"}
        ],
        "correct_index": 1,
        "concepts_tested": ["active_filters", "cutoff_frequency", "op_amps"],
        "misconceptions_detected": {"0": "supply_dictates_cutoff", "2": "amplitude_dictates_cutoff", "3": "slew_rate_dictates_cutoff"}
    },
    {
        "domain_slug": "electrical-engineering",
        "tier": 3,
        "stem": "In power systems, what is the consequence of having a very low power factor (e.g., 0.5 lagging)?",
        "options": [
            {"text": "The load consumes less real power, saving money", "tag": "misconception_low_pf_saves_money"},
            {"text": "The voltage at the load increases dangerously", "tag": "misconception_overvoltage"},
            {"text": "Large reactive currents flow, increasing I^2R losses in transmission lines without doing useful work", "tag": "correct"},
            {"text": "The frequency of the grid drops below 60Hz (or 50Hz)", "tag": "misconception_frequency_drop"}
        ],
        "correct_index": 2,
        "concepts_tested": ["power_factor", "power_systems", "reactive_power"],
        "misconceptions_detected": {"0": "low_pf_is_good", "1": "pf_causes_overvoltage", "3": "pf_causes_frequency_drop"}
    },
    {
        "domain_slug": "electrical-engineering",
        "tier": 3,
        "stem": "When analyzing a control system, you find a pole in the right-half of the s-plane. What does this indicate?",
        "options": [
            {"text": "The system is perfectly stable", "tag": "misconception_stable_rhp"},
            {"text": "The system will oscillate with a constant amplitude", "tag": "misconception_marginal_stability"},
            {"text": "The system is unstable and its response will grow exponentially over time", "tag": "correct"},
            {"text": "The system has a fast transient response", "tag": "misconception_fast_response"}
        ],
        "correct_index": 2,
        "concepts_tested": ["control_systems", "stability", "s_plane"],
        "misconceptions_detected": {"0": "rhp_pole_is_stable", "1": "rhp_pole_is_oscillator", "3": "rhp_pole_is_fast"}
    },

    # =========================================================================
    # DOMAIN: mechanical-engineering (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "mechanical-engineering",
        "tier": 1,
        "stem": "What is 'stress' in solid mechanics?",
        "options": [
            {"text": "The change in length of a material", "tag": "misconception_strain"},
            {"text": "The internal resisting force per unit area within a material", "tag": "correct"},
            {"text": "The point at which a material breaks", "tag": "misconception_fracture_point"},
            {"text": "The stiffness of a spring", "tag": "misconception_spring_constant"}
        ],
        "correct_index": 1,
        "concepts_tested": ["solid_mechanics", "stress"],
        "misconceptions_detected": {"0": "stress_is_strain", "2": "stress_is_fracture", "3": "stress_is_stiffness"}
    },
    {
        "domain_slug": "mechanical-engineering",
        "tier": 1,
        "stem": "What does a gear ratio greater than 1:1 (e.g., a small gear driving a large gear) achieve?",
        "options": [
            {"text": "Increases speed, decreases torque", "tag": "misconception_speed_increase"},
            {"text": "Decreases speed, increases torque", "tag": "correct"},
            {"text": "Increases both speed and torque", "tag": "misconception_energy_creation"},
            {"text": "Decreases both speed and torque", "tag": "misconception_energy_loss"}
        ],
        "correct_index": 1,
        "concepts_tested": ["kinematics", "gears", "torque"],
        "misconceptions_detected": {"0": "small_to_large_increases_speed", "2": "gears_create_power", "3": "gears_destroy_power"}
    },
    {
        "domain_slug": "mechanical-engineering",
        "tier": 1,
        "stem": "What is the First Law of Thermodynamics?",
        "options": [
            {"text": "Entropy always increases in an isolated system", "tag": "misconception_second_law"},
            {"text": "Energy cannot be created or destroyed, only transformed", "tag": "correct"},
            {"text": "Heat flows from cold to hot naturally", "tag": "misconception_heat_flow"},
            {"text": "Absolute zero cannot be reached", "tag": "misconception_third_law"}
        ],
        "correct_index": 1,
        "concepts_tested": ["thermodynamics", "first_law"],
        "misconceptions_detected": {"0": "first_law_is_entropy", "2": "first_law_is_heat_flow", "3": "first_law_is_absolute_zero"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "mechanical-engineering",
        "tier": 2,
        "stem": "In fluid mechanics, Bernoulli's principle states that for an incompressible fluid in steady flow:",
        "options": [
            {"text": "An increase in fluid velocity occurs simultaneously with an increase in pressure", "tag": "misconception_velocity_pressure_proportional"},
            {"text": "An increase in fluid velocity occurs simultaneously with a decrease in pressure or potential energy", "tag": "correct"},
            {"text": "Fluid velocity depends entirely on the viscosity of the fluid", "tag": "misconception_viscosity_dominant"},
            {"text": "Pressure is uniform throughout a horizontal pipe regardless of diameter", "tag": "misconception_uniform_pressure"}
        ],
        "correct_index": 1,
        "concepts_tested": ["fluid_mechanics", "bernoullis_principle"],
        "misconceptions_detected": {"0": "high_speed_means_high_pressure", "2": "viscosity_controls_velocity", "3": "pressure_ignores_geometry"}
    },
    {
        "domain_slug": "mechanical-engineering",
        "tier": 2,
        "stem": "What defines the 'yield strength' of a material on a stress-strain curve?",
        "options": [
            {"text": "The point where the material physically snaps in two", "tag": "misconception_ultimate_strength"},
            {"text": "The stress level at which the material begins to deform plastically (permanently)", "tag": "correct"},
            {"text": "The maximum stress the material can endure before necking begins", "tag": "misconception_ultimate_tensile"},
            {"text": "The slope of the linear elastic region", "tag": "misconception_youngs_modulus"}
        ],
        "correct_index": 1,
        "concepts_tested": ["material_science", "yield_strength"],
        "misconceptions_detected": {"0": "yield_is_fracture", "2": "yield_is_uts", "3": "yield_is_stiffness"}
    },
    {
        "domain_slug": "mechanical-engineering",
        "tier": 2,
        "stem": "In heat transfer, what is convection?",
        "options": [
            {"text": "Heat transfer through direct contact between stationary molecules", "tag": "misconception_conduction"},
            {"text": "Heat transfer via electromagnetic waves (e.g., sunlight)", "tag": "misconception_radiation"},
            {"text": "Heat transfer by the macroscopic bulk movement of a fluid (liquid or gas)", "tag": "correct"},
            {"text": "Heat generated by friction between solid surfaces", "tag": "misconception_friction_heat"}
        ],
        "correct_index": 2,
        "concepts_tested": ["heat_transfer", "convection"],
        "misconceptions_detected": {"0": "convection_is_conduction", "1": "convection_is_radiation", "3": "convection_is_generation"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "mechanical-engineering",
        "tier": 3,
        "stem": "You are designing a steel drive shaft. If you double the diameter of the solid shaft, how does its torsional stiffness (polar moment of inertia) change?",
        "options": [
            {"text": "It doubles (increases by a factor of 2)", "tag": "misconception_linear"},
            {"text": "It quadruples (increases by a factor of 4)", "tag": "misconception_quadratic"},
            {"text": "It increases by a factor of 16", "tag": "correct"},
            {"text": "It remains the same but the shear stress doubles", "tag": "misconception_constant_j"}
        ],
        "correct_index": 2,
        "concepts_tested": ["machine_design", "torsion", "polar_moment"],
        "misconceptions_detected": {"0": "stiffness_scales_linearly", "1": "stiffness_scales_quadratically", "3": "stiffness_is_independent_of_diameter"}
    },
    {
        "domain_slug": "mechanical-engineering",
        "tier": 3,
        "stem": "A pump is exhibiting 'cavitation'. What is the root cause of this phenomenon?",
        "options": [
            {"text": "The motor is spinning the impeller faster than its rated speed, causing overheating", "tag": "misconception_overheating"},
            {"text": "The local static pressure in the fluid drops below its vapor pressure, causing vapor bubbles to form and violently collapse", "tag": "correct"},
            {"text": "Air is leaking into the suction pipe from the atmosphere", "tag": "misconception_air_entrainment"},
            {"text": "Solid particulates are eroding the pump casing (abrasion)", "tag": "misconception_abrasion"}
        ],
        "correct_index": 1,
        "concepts_tested": ["fluid_machinery", "cavitation", "vapor_pressure"],
        "misconceptions_detected": {"0": "cavitation_is_overheating", "2": "cavitation_is_air_leak", "3": "cavitation_is_erosion"}
    },
    {
        "domain_slug": "mechanical-engineering",
        "tier": 3,
        "stem": "In the context of vibrations, what happens if a machine operates exactly at its natural frequency?",
        "options": [
            {"text": "The system experiences resonance, leading to dangerously extreme vibration amplitudes", "tag": "correct"},
            {"text": "The vibrations cancel out, resulting in perfectly smooth operation", "tag": "misconception_cancellation"},
            {"text": "The machine consumes zero power", "tag": "misconception_zero_power"},
            {"text": "The damping ratio automatically increases to absorb the energy", "tag": "misconception_auto_damping"}
        ],
        "correct_index": 0,
        "concepts_tested": ["vibrations", "resonance", "natural_frequency"],
        "misconceptions_detected": {"1": "natural_frequency_cancels_vibration", "2": "resonance_saves_power", "3": "damping_scales_with_resonance"}
    },

    # =========================================================================
    # DOMAIN: economics-macro (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "economics-macro",
        "tier": 1,
        "stem": "Gross Domestic Product (GDP) is defined as:",
        "options": [
            {"text": "The total value of all stocks traded in a country", "tag": "misconception_stock_market"},
            {"text": "The total market value of all final goods and services produced within a country in a given period", "tag": "correct"},
            {"text": "The amount of money printed by the central bank in a year", "tag": "misconception_money_supply"},
            {"text": "The total wealth held by all citizens of a country", "tag": "misconception_wealth"}
        ],
        "correct_index": 1,
        "concepts_tested": ["gdp", "national_income"],
        "misconceptions_detected": {"0": "gdp_is_stock_market", "2": "gdp_is_money_printed", "3": "gdp_is_total_wealth"}
    },
    {
        "domain_slug": "economics-macro",
        "tier": 1,
        "stem": "Inflation refers to:",
        "options": [
            {"text": "A general increase in prices and a fall in the purchasing power of money", "tag": "correct"},
            {"text": "An increase in the unemployment rate", "tag": "misconception_unemployment"},
            {"text": "A decline in a country's GDP", "tag": "misconception_recession"},
            {"text": "The government increasing taxes", "tag": "misconception_taxation"}
        ],
        "correct_index": 0,
        "concepts_tested": ["inflation", "price_levels"],
        "misconceptions_detected": {"1": "inflation_is_unemployment", "2": "inflation_is_recession", "3": "inflation_is_taxes"}
    },
    {
        "domain_slug": "economics-macro",
        "tier": 1,
        "stem": "What is the primary tool used by a Central Bank (like the Federal Reserve) to conduct monetary policy?",
        "options": [
            {"text": "Changing income tax rates", "tag": "misconception_fiscal_tax"},
            {"text": "Passing government spending bills", "tag": "misconception_fiscal_spending"},
            {"text": "Adjusting short-term interest rates", "tag": "correct"},
            {"text": "Regulating environmental standards for businesses", "tag": "misconception_regulation"}
        ],
        "correct_index": 2,
        "concepts_tested": ["monetary_policy", "central_banks"],
        "misconceptions_detected": {"0": "monetary_is_fiscal_tax", "1": "monetary_is_fiscal_spending", "3": "monetary_is_regulation"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "economics-macro",
        "tier": 2,
        "stem": "What is the difference between 'real' GDP and 'nominal' GDP?",
        "options": [
            {"text": "Real GDP includes illegal/underground markets; nominal does not", "tag": "misconception_underground_economy"},
            {"text": "Real GDP is adjusted for inflation; nominal GDP uses current prices", "tag": "correct"},
            {"text": "Nominal GDP is physical goods; real GDP includes services", "tag": "misconception_goods_services"},
            {"text": "Real GDP is projected future growth; nominal is past growth", "tag": "misconception_forecasting"}
        ],
        "correct_index": 1,
        "concepts_tested": ["real_vs_nominal", "gdp_deflator"],
        "misconceptions_detected": {"0": "real_means_shadow_economy", "2": "real_means_physical", "3": "real_means_future"}
    },
    {
        "domain_slug": "economics-macro",
        "tier": 2,
        "stem": "Expansionary fiscal policy (e.g., stimulus checks, tax cuts) is typically used to:",
        "options": [
            {"text": "Slow down an overheating economy and reduce inflation", "tag": "misconception_contractionary"},
            {"text": "Increase aggregate demand to combat a recession and lower unemployment", "tag": "correct"},
            {"text": "Pay off the national debt", "tag": "misconception_debt_reduction"},
            {"text": "Strengthen the value of the domestic currency internationally", "tag": "misconception_exchange_rate"}
        ],
        "correct_index": 1,
        "concepts_tested": ["fiscal_policy", "aggregate_demand", "business_cycle"],
        "misconceptions_detected": {"0": "expansionary_fights_inflation", "2": "stimulus_pays_debt", "3": "stimulus_strengthens_currency"}
    },
    {
        "domain_slug": "economics-macro",
        "tier": 2,
        "stem": "If a country's central bank significantly increases the money supply, what is the most likely long-term consequence?",
        "options": [
            {"text": "Permanent increase in real wealth for all citizens", "tag": "misconception_money_is_wealth"},
            {"text": "A sustained decrease in unemployment (long-run Phillips curve)", "tag": "misconception_lrpc_tradeoff"},
            {"text": "Inflation, as more money chases the same amount of goods", "tag": "correct"},
            {"text": "A permanent drop in interest rates to zero", "tag": "misconception_zero_bound"}
        ],
        "correct_index": 2,
        "concepts_tested": ["money_supply", "inflation", "quantity_theory_of_money"],
        "misconceptions_detected": {"0": "printing_money_creates_wealth", "1": "money_permanently_fixes_unemployment", "3": "money_forces_rates_to_zero_forever"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "economics-macro",
        "tier": 3,
        "stem": "A country faces 'stagflation'. Why does this present a dilemma for central banks?",
        "options": [
            {"text": "Because they must coordinate with foreign banks, violating sovereignty", "tag": "misconception_sovereignty"},
            {"text": "Because standard tools conflict: raising rates fights inflation but worsens unemployment, while cutting rates helps unemployment but worsens inflation", "tag": "correct"},
            {"text": "Because it means the stock market and bond market are both crashing", "tag": "misconception_market_crash"},
            {"text": "Because they cannot legally change interest rates during stagflation", "tag": "misconception_legal_restriction"}
        ],
        "correct_index": 1,
        "concepts_tested": ["stagflation", "monetary_policy_dilemmas", "phillips_curve"],
        "misconceptions_detected": {"0": "stagflation_is_foreign", "2": "stagflation_is_market_crash", "3": "stagflation_removes_legal_power"}
    },
    {
        "domain_slug": "economics-macro",
        "tier": 3,
        "stem": "According to the Mundell-Fleming 'Impossible Trinity' (Trilemma), a country cannot simultaneously maintain:",
        "options": [
            {"text": "Low taxes, large government spending, and a balanced budget", "tag": "misconception_fiscal_trilemma"},
            {"text": "Economic growth, low unemployment, and price stability (low inflation)", "tag": "correct"},
            {"text": "Elevated inflation, low unemployment, and strong GDP growth", "tag": "misconception_macro_goals"},
            {"text": "A trade surplus, a budget surplus, and full employment", "tag": "misconception_surplus_trilemma"}
        ],
        "correct_index": 1,
        "concepts_tested": ["international_macroeconomics", "impossible_trinity", "exchange_rates"],
        "misconceptions_detected": {"0": "trilemma_is_fiscal", "2": "trilemma_is_inflation_unemployment", "3": "trilemma_is_surplus"}
    },
    {
        "domain_slug": "economics-macro",
        "tier": 3,
        "stem": "If the government heavily borrows from the domestic market to fund a deficit, private investment may fall. This phenomenon is known as:",
        "options": [
            {"text": "The Multiplier Effect", "tag": "misconception_multiplier"},
            {"text": "Crowding Out", "tag": "correct"},
            {"text": "Quantitative Easing", "tag": "misconception_qe"},
            {"text": "Capital Flight", "tag": "misconception_capital_flight"}
        ],
        "correct_index": 1,
        "concepts_tested": ["fiscal_policy", "crowding_out", "loanable_funds_market"],
        "misconceptions_detected": {"0": "deficit_is_multiplier", "2": "deficit_is_qe", "3": "domestic_borrowing_is_capital_flight"}
    },

    # =========================================================================
    # DOMAIN: finance-accounting (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "finance-accounting",
        "tier": 1,
        "stem": "The fundamental accounting equation is:",
        "options": [
            {"text": "Revenue - Expenses = Net Income", "tag": "misconception_income_statement"},
            {"text": "Assets = Liabilities + Equity", "tag": "correct"},
            {"text": "Cash In - Cash Out = Cash Flow", "tag": "misconception_cash_flow"},
            {"text": "Debits = Credits", "tag": "misconception_double_entry"}
        ],
        "correct_index": 1,
        "concepts_tested": ["accounting_equation", "balance_sheet"],
        "misconceptions_detected": {"0": "accounting_eq_is_income_stmt", "2": "accounting_eq_is_cash_flow", "3": "accounting_eq_is_double_entry_rule"}
    },
    {
        "domain_slug": "finance-accounting",
        "tier": 1,
        "stem": "What is the primary difference between debt (bonds) and equity (stocks)?",
        "options": [
            {"text": "Equity must be paid back with interest; debt does not", "tag": "misconception_swapped_definitions"},
            {"text": "Debt represents a loan that must be repaid; equity represents ownership in the company", "tag": "correct"},
            {"text": "Debt is only used by governments; equity is only used by corporations", "tag": "misconception_issuer_restriction"},
            {"text": "Equity provides guaranteed returns; debt is risky", "tag": "misconception_risk_profile"}
        ],
        "correct_index": 1,
        "concepts_tested": ["capital_structure", "debt_vs_equity"],
        "misconceptions_detected": {"0": "equity_is_loan", "2": "debt_only_for_govs", "3": "equity_is_guaranteed"}
    },
    {
        "domain_slug": "finance-accounting",
        "tier": 1,
        "stem": "What does a 'Balance Sheet' show?",
        "options": [
            {"text": "The company's revenues and expenses over a year", "tag": "misconception_income_stmt"},
            {"text": "A snapshot of the company's assets, liabilities, and equity at a specific point in time", "tag": "correct"},
            {"text": "The actual cash that moved in and out of the company", "tag": "misconception_cash_flow_stmt"},
            {"text": "The future projected earnings of the company", "tag": "misconception_pro_forma"}
        ],
        "correct_index": 1,
        "concepts_tested": ["financial_statements", "balance_sheet"],
        "misconceptions_detected": {"0": "balance_sheet_is_income", "2": "balance_sheet_is_cash_flow", "3": "balance_sheet_is_projection"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "finance-accounting",
        "tier": 2,
        "stem": "What is the Time Value of Money principle?",
        "options": [
            {"text": "Money loses its physical value as paper degrades over time", "tag": "misconception_physical_degradation"},
            {"text": "A dollar today is worth more than a dollar in the future because it can be invested to earn interest", "tag": "correct"},
            {"text": "The stock market always goes up over long periods of time", "tag": "misconception_market_always_rises"},
            {"text": "Employees must be paid based on the time they spend working", "tag": "misconception_wage_theory"}
        ],
        "correct_index": 1,
        "concepts_tested": ["time_value_of_money", "present_value"],
        "misconceptions_detected": {"0": "tvm_is_wear_and_tear", "2": "tvm_is_stock_market", "3": "tvm_is_hourly_wages"}
    },
    {
        "domain_slug": "finance-accounting",
        "tier": 2,
        "stem": "Accrual accounting differs from cash accounting because it:",
        "options": [
            {"text": "Records revenues when earned and expenses when incurred, regardless of when cash changes hands", "tag": "correct"},
            {"text": "Only records transactions when actual cash is received or paid", "tag": "misconception_cash_accounting"},
            {"text": "Is only used for tax purposes to minimize tax liability", "tag": "misconception_tax_avoidance"},
            {"text": "Ignores liabilities and only tracks assets", "tag": "misconception_asset_only"}
        ],
        "correct_index": 0,
        "concepts_tested": ["accrual_accounting", "matching_principle"],
        "misconceptions_detected": {"1": "accrual_is_cash", "2": "accrual_is_tax_loophole", "3": "accrual_ignores_liabilities"}
    },
    {
        "domain_slug": "finance-accounting",
        "tier": 2,
        "stem": "What does a large Price-to-Earnings (P/E) ratio typically suggest about a stock?",
        "options": [
            {"text": "The company is extremely profitable right now relative to its peers", "tag": "misconception_current_profit"},
            {"text": "The company is about to go bankrupt", "tag": "misconception_bankruptcy"},
            {"text": "Investors expect strong future growth rates from the company", "tag": "correct"},
            {"text": "The stock pays a very large dividend", "tag": "misconception_dividends"}
        ],
        "correct_index": 2,
        "concepts_tested": ["valuation_metrics", "pe_ratio", "growth_stocks"],
        "misconceptions_detected": {"0": "high_pe_means_high_current_profit", "1": "high_pe_means_distress", "3": "high_pe_means_high_dividend"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "finance-accounting",
        "tier": 3,
        "stem": "You are evaluating a project using Net Present Value (NPV). If the NPV is positive at your cost of capital, you should:",
        "options": [
            {"text": "Reject the project because it will drain cash reserves", "tag": "misconception_reject_positive_npv"},
            {"text": "Accept the project because it generates value exceeding the required return", "tag": "correct"},
            {"text": "Wait until the NPV reaches zero before starting", "tag": "misconception_wait_for_zero"},
            {"text": "Only accept if the Internal Rate of Return (IRR) is lower than the cost of capital", "tag": "misconception_irr_inverted"}
        ],
        "correct_index": 1,
        "concepts_tested": ["capital_budgeting", "npv", "corporate_finance"],
        "misconceptions_detected": {"0": "positive_npv_is_bad", "2": "zero_npv_is_target", "3": "irr_should_be_lower_than_wacc"}
    },
    {
        "domain_slug": "finance-accounting",
        "tier": 3,
        "stem": "A company recognizes revenue this year for a 3-year subscription paid upfront. According to GAAP matching principles, how should this be handled?",
        "options": [
            {"text": "Record all revenue immediately on the Income Statement since cash was received", "tag": "misconception_cash_basis_revenue"},
            {"text": "Record it as a Liability (Deferred/Unearned Revenue) and recognize 1/3 of the revenue on the Income Statement each year", "tag": "correct"},
            {"text": "Put the cash in an escrow account and do not record anything until year 3", "tag": "misconception_no_entry_until_end"},
            {"text": "Record the full amount as Equity immediately", "tag": "misconception_revenue_is_equity"}
        ],
        "correct_index": 1,
        "concepts_tested": ["deferred_revenue", "revenue_recognition", "gaap"],
        "misconceptions_detected": {"0": "immediate_revenue_recognition", "2": "no_accounting_until_service_ends", "3": "cash_creates_equity"}
    },
    {
        "domain_slug": "finance-accounting",
        "tier": 3,
        "stem": "When interest rates rise in the broader economy, what happens to the price of existing fixed-rate bonds trading in the secondary market?",
        "options": [
            {"text": "Their prices rise because all financial assets go up with interest rates", "tag": "misconception_bonds_rise_with_rates"},
            {"text": "Their prices fall, because newly issued bonds offer higher yields, making older, lower-yielding bonds less attractive", "tag": "correct"},
            {"text": "Their prices stay exactly the same, only the coupon payment changes", "tag": "misconception_fixed_price_variable_coupon"},
            {"text": "The bond issuers immediately recall the bonds", "tag": "misconception_automatic_recall"}
        ],
        "correct_index": 1,
        "concepts_tested": ["fixed_income", "interest_rate_risk", "bond_pricing"],
        "misconceptions_detected": {"0": "bond_prices_correlate_positively_with_rates", "2": "bonds_never_change_price", "3": "rate_hikes_force_recalls"}
    },

    # =========================================================================
    # DOMAIN: psychology-fundamentals (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 1,
        "stem": "In classical conditioning (like Pavlov's dogs), what is a 'conditioned stimulus'?",
        "options": [
            {"text": "A natural, unlearned reaction to an event (e.g., salivating to food)", "tag": "misconception_unconditioned_response"},
            {"text": "A previously neutral stimulus that, after association with an unconditioned stimulus, triggers a learned response (e.g., a ringing bell)", "tag": "correct"},
            {"text": "A reward given to reinforce good behavior", "tag": "misconception_operant_reward"},
            {"text": "A punishment given to stop bad behavior", "tag": "misconception_operant_punishment"}
        ],
        "correct_index": 1,
        "concepts_tested": ["classical_conditioning", "behaviorism"],
        "misconceptions_detected": {"0": "cs_is_ur", "2": "cs_is_operant_reward", "3": "cs_is_operant_punishment"}
    },
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 1,
        "stem": "Which part of the brain is primarily associated with processing emotions, particularly fear and aggression?",
        "options": [
            {"text": "Cerebellum", "tag": "misconception_cerebellum"},
            {"text": "Prefrontal Cortex", "tag": "misconception_prefrontal"},
            {"text": "Amygdala", "tag": "correct"},
            {"text": "Medulla Oblongata", "tag": "misconception_medulla"}
        ],
        "correct_index": 2,
        "concepts_tested": ["neuroscience", "amygdala", "emotion"],
        "misconceptions_detected": {"0": "cerebellum_does_emotion", "1": "prefrontal_does_raw_emotion", "3": "medulla_does_emotion"}
    },
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 1,
        "stem": "What is the 'Confirmation Bias'?",
        "options": [
            {"text": "The tendency to remember the first piece of information you hear", "tag": "misconception_anchoring"},
            {"text": "The tendency to seek out, interpret, and remember information that confirms your pre-existing beliefs", "tag": "correct"},
            {"text": "The belief that you could have predicted an event after it has already happened", "tag": "misconception_hindsight"},
            {"text": "The tendency to blame others for failures but take credit for successes", "tag": "misconception_self_serving"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cognitive_biases", "confirmation_bias"],
        "misconceptions_detected": {"0": "confirmation_is_anchoring", "2": "confirmation_is_hindsight", "3": "confirmation_is_self_serving"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 2,
        "stem": "According to Piaget's theory of cognitive development, what is 'Object Permanence'?",
        "options": [
            {"text": "A child's ability to classify objects by shape and color", "tag": "misconception_classification"},
            {"text": "The understanding that objects continue to exist even when they cannot be seen, heard, or touched", "tag": "correct"},
            {"text": "A child's belief that inanimate objects have feelings", "tag": "misconception_animism"},
            {"text": "The realization that a quantity of liquid remains the same when poured into a different shaped glass", "tag": "misconception_conservation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["developmental_psychology", "piaget", "object_permanence"],
        "misconceptions_detected": {"0": "permanence_is_classification", "2": "permanence_is_animism", "3": "permanence_is_conservation"}
    },
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 2,
        "stem": "In operant conditioning, what is 'Negative Reinforcement'?",
        "options": [
            {"text": "Punishing a subject to decrease a behavior", "tag": "misconception_punishment"},
            {"text": "Removing an unpleasant stimulus to increase or maintain a behavior", "tag": "correct"},
            {"text": "Ignoring a behavior until it stops happening", "tag": "misconception_extinction"},
            {"text": "Adding an unpleasant stimulus to stop a behavior", "tag": "misconception_positive_punishment"}
        ],
        "correct_index": 1,
        "concepts_tested": ["operant_conditioning", "negative_reinforcement"],
        "misconceptions_detected": {"0": "negative_reinforcement_is_punishment", "2": "negative_reinforcement_is_extinction", "3": "negative_reinforcement_is_positive_punishment"}
    },
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 2,
        "stem": "What does the 'Fundamental Attribution Error' describe?",
        "options": [
            {"text": "Overestimating the impact of situational factors and underestimating personality when judging others", "tag": "misconception_inverted_error"},
            {"text": "Underestimating situational factors and overestimating personality/dispositional factors when judging others' behavior", "tag": "correct"},
            {"text": "Assuming that attractive people are inherently better at everything", "tag": "misconception_halo_effect"},
            {"text": "Believing that everyone else shares your opinions and values", "tag": "misconception_false_consensus"}
        ],
        "correct_index": 1,
        "concepts_tested": ["social_psychology", "attribution_theory"],
        "misconceptions_detected": {"0": "fae_is_inverted", "2": "fae_is_halo_effect", "3": "fae_is_false_consensus"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 3,
        "stem": "A patient experiences extreme, irrational fear of spiders (arachnophobia). A therapist gradually exposes them to spider imagery, then a plastic spider, and finally a real spider, while teaching relaxation techniques. This therapy is based on:",
        "options": [
            {"text": "Psychoanalysis and dream interpretation", "tag": "misconception_psychoanalysis"},
            {"text": "Systematic Desensitization (a form of Classical Conditioning)", "tag": "correct"},
            {"text": "Client-Centered Therapy (Humanistic)", "tag": "misconception_humanistic"},
            {"text": "Aversion Therapy", "tag": "misconception_aversion"}
        ],
        "correct_index": 1,
        "concepts_tested": ["clinical_psychology", "behavioral_therapy", "systematic_desensitization"],
        "misconceptions_detected": {"0": "exposure_is_freudian", "2": "exposure_is_humanistic", "3": "exposure_is_aversion"}
    },
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 3,
        "stem": "In memory research, you witness a car crash. Later, a lawyer asks, 'How fast were the cars going when they smashed into each other?' instead of 'hit each other'. You subsequently remember broken glass that wasn't there. This demonstrates:",
        "options": [
            {"text": "The Misinformation Effect (Elizabeth Loftus' research on memory reconstruction)", "tag": "correct"},
            {"text": "Proactive Interference", "tag": "misconception_proactive_interference"},
            {"text": "State-Dependent Memory", "tag": "misconception_state_dependent"},
            {"text": "Anterograde Amnesia", "tag": "misconception_amnesia"}
        ],
        "correct_index": 0,
        "concepts_tested": ["cognitive_psychology", "memory", "misinformation_effect"],
        "misconceptions_detected": {"1": "misinfo_is_interference", "2": "misinfo_is_state_dependent", "3": "misinfo_is_amnesia"}
    },
    {
        "domain_slug": "psychology-fundamentals",
        "tier": 3,
        "stem": "You are designing an app interface. Users keep clicking 'Cancel' when they mean to click 'Submit' because the 'Cancel' button is bright green and on the right side. This error is best explained by a failure to account for:",
        "options": [
            {"text": "Cognitive Dissonance", "tag": "misconception_cognitive_dissonance"},
            {"text": "Mental schemas and stimulus-response compatibility (Human Factors/Ergonomics)", "tag": "correct"},
            {"text": "The bystander effect", "tag": "misconception_bystander"},
            {"text": "Maslow's Hierarchy of Needs", "tag": "misconception_maslow"}
        ],
        "correct_index": 1,
        "concepts_tested": ["human_factors", "schemas", "applied_psychology"],
        "misconceptions_detected": {"0": "ui_error_is_dissonance", "2": "ui_error_is_bystander", "3": "ui_error_is_maslow"}
    },

    # =========================================================================
    # DOMAIN: philosophy (9 questions)
    # =========================================================================
    # --- Tier 1: Foundational ---
    {
        "domain_slug": "philosophy",
        "tier": 1,
        "stem": "What is the primary concern of the branch of philosophy known as 'Epistemology'?",
        "options": [
            {"text": "The study of right and wrong behavior", "tag": "misconception_ethics"},
            {"text": "The study of knowledge, its nature, and how we acquire it", "tag": "correct"},
            {"text": "The study of the fundamental nature of reality and existence", "tag": "misconception_metaphysics"},
            {"text": "The study of art and beauty", "tag": "misconception_aesthetics"}
        ],
        "correct_index": 1,
        "concepts_tested": ["branches_of_philosophy", "epistemology"],
        "misconceptions_detected": {"0": "epistemology_is_ethics", "2": "epistemology_is_metaphysics", "3": "epistemology_is_aesthetics"}
    },
    {
        "domain_slug": "philosophy",
        "tier": 1,
        "stem": "In Ethics, what does 'Utilitarianism' (associated with Bentham and Mill) propose?",
        "options": [
            {"text": "Actions are right if they follow universal moral rules, regardless of consequences", "tag": "misconception_deontology"},
            {"text": "Actions are right if they promote the greatest happiness or well-being for the greatest number of people", "tag": "correct"},
            {"text": "Morality is entirely subjective and depends on culture", "tag": "misconception_relativism"},
            {"text": "Individuals should only act in their own self-interest", "tag": "misconception_egoism"}
        ],
        "correct_index": 1,
        "concepts_tested": ["ethics", "utilitarianism"],
        "misconceptions_detected": {"0": "utilitarianism_is_deontology", "2": "utilitarianism_is_relativism", "3": "utilitarianism_is_egoism"}
    },
    {
        "domain_slug": "philosophy",
        "tier": 1,
        "stem": "René Descartes' famous statement 'Cogito, ergo sum' (I think, therefore I am) was his attempt to:",
        "options": [
            {"text": "Prove that the physical world is an illusion", "tag": "misconception_illusion"},
            {"text": "Find an absolutely certain foundational truth that could not be doubted", "tag": "correct"},
            {"text": "Argue that only intelligent people exist", "tag": "misconception_elitism"},
            {"text": "Prove the existence of God through logic", "tag": "misconception_ontological"}
        ],
        "correct_index": 1,
        "concepts_tested": ["modern_philosophy", "descartes", "skepticism"],
        "misconceptions_detected": {"0": "cogito_proves_illusion", "2": "cogito_is_elitism", "3": "cogito_is_ontological_argument"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "philosophy",
        "tier": 2,
        "stem": "What is the central premise of John Locke's 'Tabula Rasa' theory?",
        "options": [
            {"text": "Humans are born with innate ideas implanted by God", "tag": "misconception_innate_ideas"},
            {"text": "The human mind at birth is a 'blank slate' and all knowledge comes from experience and sensory perception", "tag": "correct"},
            {"text": "Society corrupts the natural goodness of human beings", "tag": "misconception_rousseau"},
            {"text": "Only mathematical truths can be known with certainty", "tag": "misconception_rationalism"}
        ],
        "correct_index": 1,
        "concepts_tested": ["empiricism", "locke"],
        "misconceptions_detected": {"0": "tabula_rasa_is_innate", "2": "tabula_rasa_is_noble_savage", "3": "tabula_rasa_is_rationalism"}
    },
    {
        "domain_slug": "philosophy",
        "tier": 2,
        "stem": "In Kantian ethics, what is a 'Categorical Imperative'?",
        "options": [
            {"text": "A command that applies only if you want to achieve a specific goal", "tag": "misconception_hypothetical"},
            {"text": "An unconditional moral obligation that is binding in all circumstances and is not dependent on a person's inclination or purpose", "tag": "correct"},
            {"text": "A moral rule determined by a majority vote of society", "tag": "misconception_democratic_ethics"},
            {"text": "The idea that the ends always justify the means", "tag": "misconception_consequentialism"}
        ],
        "correct_index": 1,
        "concepts_tested": ["deontology", "kant"],
        "misconceptions_detected": {"0": "categorical_is_hypothetical", "2": "categorical_is_social_contract", "3": "categorical_is_consequentialism"}
    },
    {
        "domain_slug": "philosophy",
        "tier": 2,
        "stem": "What is Plato's 'Allegory of the Cave' primarily meant to illustrate?",
        "options": [
            {"text": "That humans evolved from cave-dwelling ancestors", "tag": "misconception_evolution"},
            {"text": "The difference between relying on flawed sensory appearances versus grasping true reality through philosophical reasoning (the Forms)", "tag": "correct"},
            {"text": "That society should be ruled by a brutal dictator", "tag": "misconception_tyranny"},
            {"text": "That all art is a beautiful expression of human emotion", "tag": "misconception_art"}
        ],
        "correct_index": 1,
        "concepts_tested": ["ancient_philosophy", "plato", "theory_of_forms"],
        "misconceptions_detected": {"0": "cave_is_evolution", "2": "cave_is_dictatorship", "3": "cave_is_aesthetics"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "philosophy",
        "tier": 3,
        "stem": "A trolley is barreling down a track toward five tied-up people. You can pull a lever to divert it to a track with one tied-up person. A strict Kantian (Deontologist) might argue you should NOT pull the lever because:",
        "options": [
            {"text": "Pulling the lever actively uses the one person as a mere means to an end, violating the categorical imperative, whereas doing nothing is just letting nature take its course", "tag": "correct"},
            {"text": "Saving five lives maximizes overall utility, making pulling the lever morally mandatory", "tag": "misconception_utilitarian"},
            {"text": "The five people might be criminals, so they deserve it", "tag": "misconception_retributive"},
            {"text": "You do not have enough information to make a calculated decision", "tag": "misconception_epistemic_paralysis"}
        ],
        "correct_index": 0,
        "concepts_tested": ["applied_ethics", "trolley_problem", "deontology"],
        "misconceptions_detected": {"1": "kant_is_utilitarian", "2": "kant_is_retributive", "3": "kant_is_skepticism"}
    },
    {
        "domain_slug": "philosophy",
        "tier": 3,
        "stem": "According to Existentialism (e.g., Sartre), 'Existence precedes essence'. This means:",
        "options": [
            {"text": "God created human essence before putting humans on earth", "tag": "misconception_creationism"},
            {"text": "Humans first exist without any predefined purpose or inherent nature, and must actively define their own essence through their choices and actions", "tag": "correct"},
            {"text": "The physical body (existence) is less important than the soul (essence)", "tag": "misconception_dualism"},
            {"text": "Human nature is genetically predetermined before birth", "tag": "misconception_determinism"}
        ],
        "correct_index": 1,
        "concepts_tested": ["existentialism", "sartre", "meaning"],
        "misconceptions_detected": {"0": "existentialism_is_creationism", "2": "existence_precedes_essence_is_dualism", "3": "existentialism_is_determinism"}
    },
    {
        "domain_slug": "philosophy",
        "tier": 3,
        "stem": "In the Philosophy of Science, what is Karl Popper's concept of 'Falsifiability'?",
        "options": [
            {"text": "A scientific theory is only valid if it has been proven 100% true", "tag": "misconception_verification"},
            {"text": "For a theory to be considered scientific, it must be inherently capable of being proven false by an observation or experiment", "tag": "correct"},
            {"text": "Scientists should falsify data to make their theories fit", "tag": "misconception_fraud"},
            {"text": "Science is entirely subjective and all theories are equally false", "tag": "misconception_relativism"}
        ],
        "correct_index": 1,
        "concepts_tested": ["philosophy_of_science", "falsifiability", "demarcation_problem"],
        "misconceptions_detected": {"0": "falsifiability_is_verification", "2": "falsifiability_is_fraud", "3": "falsifiability_is_relativism"}
    },

    # =========================================================================
    # DOMAIN: blockchain-crypto (9 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "blockchain-crypto",
        "tier": 1,
        "stem": "What is a 'blockchain' in its most fundamental sense?",
        "options": [
            {"text": "A centralized database maintained by a single trusted entity", "tag": "misconception_centralized"},
            {"text": "A distributed, append-only ledger maintained by a network of nodes", "tag": "correct"},
            {"text": "A type of physical hardware used to store cryptocurrencies", "tag": "misconception_hardware"},
            {"text": "An ultra-fast trading algorithm for the stock market", "tag": "misconception_trading_algo"}
        ],
        "correct_index": 1,
        "concepts_tested": ["blockchain_basics", "distributed_ledger"],
        "misconceptions_detected": {"0": "blockchain_is_centralized", "2": "blockchain_is_hardware", "3": "blockchain_is_algo"}
    },
    {
        "domain_slug": "blockchain-crypto",
        "tier": 1,
        "stem": "What does a cryptographic 'hash function' do in a blockchain?",
        "options": [
            {"text": "It encrypts a message so only the intended recipient can read it", "tag": "misconception_encryption"},
            {"text": "It takes an input of any size and produces a fixed-size string of characters (a fingerprint) that changes drastically if the input is altered", "tag": "correct"},
            {"text": "It compresses the blockchain data to save storage space", "tag": "misconception_compression"},
            {"text": "It generates new coins during the mining process", "tag": "misconception_coin_generation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["hash_functions", "cryptography"],
        "misconceptions_detected": {"0": "hashing_as_encryption", "2": "hashing_as_compression", "3": "hashing_generates_coins"}
    },
    {
        "domain_slug": "blockchain-crypto",
        "tier": 1,
        "stem": "What is the role of a 'Private Key' in a cryptocurrency wallet?",
        "options": [
            {"text": "It acts as a public address for others to send funds to", "tag": "misconception_public_key"},
            {"text": "It allows a third-party exchange to recover the account if the password is lost", "tag": "misconception_recovery_phrase"},
            {"text": "It mathematically proves ownership of funds and authorizes transactions", "tag": "correct"},
            {"text": "It tracks the history of all transactions made by the wallet", "tag": "misconception_tx_history"}
        ],
        "correct_index": 2,
        "concepts_tested": ["private_keys", "digital_signatures"],
        "misconceptions_detected": {"0": "private_as_public_key", "1": "private_as_recovery_mechanism", "3": "private_as_ledger"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "blockchain-crypto",
        "tier": 2,
        "stem": "How does the 'Proof of Work' (PoW) consensus mechanism secure a network like Bitcoin?",
        "options": [
            {"text": "By requiring participants (miners) to expend computational energy to solve a math puzzle, making it economically infeasible to rewrite the ledger history", "tag": "correct"},
            {"text": "By having a central authority manually verify the 'work' done by each user", "tag": "misconception_central_verification"},
            {"text": "By requiring users to stake a large amount of cryptocurrency to validate transactions", "tag": "misconception_pos_confusion"},
            {"text": "By encrypting all transactions with AES-256", "tag": "misconception_encryption_is_security"}
        ],
        "correct_index": 0,
        "concepts_tested": ["proof_of_work", "consensus_mechanisms", "security"],
        "misconceptions_detected": {"1": "pow_requires_central_auth", "2": "pow_is_pos", "3": "pow_is_just_encryption"}
    },
    {
        "domain_slug": "blockchain-crypto",
        "tier": 2,
        "stem": "What is a 'Smart Contract' (e.g., on Ethereum)?",
        "options": [
            {"text": "A legally binding agreement drafted by lawyers and signed digitally", "tag": "misconception_legal_contract"},
            {"text": "Code deployed to the blockchain that automatically executes when predefined conditions are met", "tag": "correct"},
            {"text": "An AI agent that negotiates trades on decentralized exchanges", "tag": "misconception_ai_agent"},
            {"text": "A protocol for upgrading the underlying blockchain software", "tag": "misconception_upgrade_protocol"}
        ],
        "correct_index": 1,
        "concepts_tested": ["smart_contracts", "ethereum", "automation"],
        "misconceptions_detected": {"0": "smart_contract_is_legal", "2": "smart_contract_is_ai", "3": "smart_contract_is_bip"}
    },
    {
        "domain_slug": "blockchain-crypto",
        "tier": 2,
        "stem": "What does 'decentralization' refer to in the context of cryptocurrencies?",
        "options": [
            {"text": "The price of the currency is not tied to any fiat money like the US Dollar", "tag": "misconception_stablecoin"},
            {"text": "Control and decision-making are distributed among a network of users rather than a single central authority (like a bank)", "tag": "correct"},
            {"text": "Transactions are completely anonymous and untraceable", "tag": "misconception_anonymity"},
            {"text": "The currency can be used anywhere in the world without internet access", "tag": "misconception_offline"}
        ],
        "correct_index": 1,
        "concepts_tested": ["decentralization", "trustless_systems"],
        "misconceptions_detected": {"0": "decentralization_is_unpegged", "2": "decentralization_is_anonymity", "3": "decentralization_is_offline"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "blockchain-crypto",
        "tier": 3,
        "stem": "What is a '51% Attack' on a Proof of Work blockchain?",
        "options": [
            {"text": "When 51% of users lose their private keys", "tag": "misconception_lost_keys"},
            {"text": "When a single entity gains control of more than half the network's mining hash rate, allowing them to rewrite recent transaction history and double-spend coins", "tag": "correct"},
            {"text": "When the price of the cryptocurrency drops by 51% in a single day", "tag": "misconception_price_crash"},
            {"text": "When 51% of nodes are disconnected from the internet, halting the network", "tag": "misconception_network_outage"}
        ],
        "correct_index": 1,
        "concepts_tested": ["51_percent_attack", "network_security", "double_spending"],
        "misconceptions_detected": {"0": "attack_is_lost_keys", "2": "attack_is_price_crash", "3": "attack_is_outage"}
    },
    {
        "domain_slug": "blockchain-crypto",
        "tier": 3,
        "stem": "In Solidity (Ethereum smart contracts), what is a 'Reentrancy Attack'?",
        "options": [
            {"text": "When an attacker repeatedly calls a vulnerable contract function (like withdraw) before the contract updates its internal state (like user balance)", "tag": "correct"},
            {"text": "When a user logs into a DApp from multiple devices simultaneously", "tag": "misconception_multiple_logins"},
            {"text": "When miners reorganize blocks to favor their own transactions (MEV)", "tag": "misconception_mev"},
            {"text": "When a smart contract accidentally deletes itself using selfdestruct", "tag": "misconception_selfdestruct"}
        ],
        "correct_index": 0,
        "concepts_tested": ["smart_contract_security", "reentrancy", "solidity"],
        "misconceptions_detected": {"1": "reentrancy_as_logins", "2": "reentrancy_as_mev", "3": "reentrancy_as_selfdestruct"}
    },
    {
        "domain_slug": "blockchain-crypto",
        "tier": 3,
        "stem": "What is the primary purpose of a 'Layer 2' solution (like the Lightning Network or Rollups)?",
        "options": [
            {"text": "To increase the security and decentralization of the base blockchain (Layer 1)", "tag": "misconception_l2_security"},
            {"text": "To process transactions off the main chain to improve speed and reduce fees, while relying on the main chain for final security", "tag": "correct"},
            {"text": "To create a bridge between entirely different blockchains (e.g., Bitcoin and Ethereum)", "tag": "misconception_cross_chain_bridge"},
            {"text": "To provide a user-friendly graphical interface for interacting with smart contracts", "tag": "misconception_frontend"}
        ],
        "correct_index": 1,
        "concepts_tested": ["layer_2", "scaling_solutions", "blockchain_trilemma"],
        "misconceptions_detected": {"0": "l2_is_for_security", "2": "l2_is_bridge", "3": "l2_is_ui"}
    },

    # =========================================================================
    # DOMAIN: physics-fundamentals (9 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "physics-fundamentals",
        "tier": 1,
        "stem": "Newton's First Law (Inertia) states that an object in motion will stay in motion unless acted upon by:",
        "options": [
            {"text": "Gravity", "tag": "misconception_gravity_only"},
            {"text": "Friction", "tag": "misconception_friction_only"},
            {"text": "An unbalanced external force", "tag": "correct"},
            {"text": "Mass", "tag": "misconception_mass_as_force"}
        ],
        "correct_index": 2,
        "concepts_tested": ["newtons_laws", "inertia"],
        "misconceptions_detected": {"0": "inertia_only_broken_by_gravity", "1": "inertia_only_broken_by_friction", "3": "mass_is_a_force"}
    },
    {
        "domain_slug": "physics-fundamentals",
        "tier": 1,
        "stem": "What is the difference between speed and velocity?",
        "options": [
            {"text": "Velocity is used for fast objects; speed is for slow objects", "tag": "misconception_magnitude_based"},
            {"text": "Velocity includes both speed and direction (it is a vector); speed is just a magnitude (a scalar)", "tag": "correct"},
            {"text": "They are identical terms in physics", "tag": "misconception_synonyms"},
            {"text": "Speed includes direction; velocity does not", "tag": "misconception_reversed_definitions"}
        ],
        "correct_index": 1,
        "concepts_tested": ["kinematics", "vectors_scalars"],
        "misconceptions_detected": {"0": "velocity_means_fast", "2": "speed_and_velocity_are_same", "3": "speed_is_vector"}
    },
    {
        "domain_slug": "physics-fundamentals",
        "tier": 1,
        "stem": "According to the Law of Conservation of Energy:",
        "options": [
            {"text": "Energy can be created from nothing if the system is closed", "tag": "misconception_creation"},
            {"text": "Energy cannot be created or destroyed, only transformed from one form to another", "tag": "correct"},
            {"text": "Total energy in the universe is constantly decreasing", "tag": "misconception_decreasing_energy"},
            {"text": "Energy is destroyed when an object stops moving", "tag": "misconception_destruction_on_stop"}
        ],
        "correct_index": 1,
        "concepts_tested": ["conservation_of_energy", "thermodynamics"],
        "misconceptions_detected": {"0": "energy_can_be_created", "2": "energy_decreases_over_time", "3": "kinetic_energy_destroyed_when_stopped"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "physics-fundamentals",
        "tier": 2,
        "stem": "If you drop a heavy bowling ball and a light feather in a perfect vacuum, what happens?",
        "options": [
            {"text": "The bowling ball hits the ground first because it has more mass", "tag": "misconception_heavy_falls_faster"},
            {"text": "They hit the ground at the same time because gravity accelerates all objects equally in the absence of air resistance", "tag": "correct"},
            {"text": "The feather floats because there is no air pushing it down", "tag": "misconception_vacuum_means_zero_gravity"},
            {"text": "The bowling ball falls slower due to its higher inertia", "tag": "misconception_inertia_slows_fall"}
        ],
        "correct_index": 1,
        "concepts_tested": ["gravity", "free_fall", "acceleration"],
        "misconceptions_detected": {"0": "heavy_objects_fall_faster", "2": "vacuum_means_no_gravity", "3": "inertia_overcomes_gravity"}
    },
    {
        "domain_slug": "physics-fundamentals",
        "tier": 2,
        "stem": "In an electric circuit, what is the role of 'voltage'?",
        "options": [
            {"text": "It is the measure of the rate of flow of electrons", "tag": "misconception_current_confusion"},
            {"text": "It is the resistance that slows down the electrons", "tag": "misconception_resistance_confusion"},
            {"text": "It is the electrical potential difference (the 'push') that drives the current", "tag": "correct"},
            {"text": "It is the total amount of energy consumed by the circuit", "tag": "misconception_power_confusion"}
        ],
        "correct_index": 2,
        "concepts_tested": ["electromagnetism", "voltage", "circuits"],
        "misconceptions_detected": {"0": "voltage_is_current", "1": "voltage_is_resistance", "3": "voltage_is_power"}
    },
    {
        "domain_slug": "physics-fundamentals",
        "tier": 2,
        "stem": "When a moving car slams on its brakes, the brake pads heat up. This is an example of:",
        "options": [
            {"text": "Kinetic energy being converted into thermal energy via friction", "tag": "correct"},
            {"text": "Thermal energy being created from nothing", "tag": "misconception_energy_creation"},
            {"text": "Potential energy being converted into kinetic energy", "tag": "misconception_potential_to_kinetic"},
            {"text": "The destruction of energy", "tag": "misconception_energy_destruction"}
        ],
        "correct_index": 0,
        "concepts_tested": ["energy_transformation", "friction", "work"],
        "misconceptions_detected": {"1": "creating_energy_from_nothing", "2": "confusing_potential_and_kinetic", "3": "energy_can_be_destroyed"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "physics-fundamentals",
        "tier": 3,
        "stem": "A satellite is in a stable circular orbit around Earth. How much work does Earth's gravity do on the satellite during one full orbit?",
        "options": [
            {"text": "A massive amount, equal to the force of gravity multiplied by the circumference of the orbit", "tag": "misconception_force_times_distance"},
            {"text": "Zero, because the force of gravity is perpendicular to the satellite's displacement at all times", "tag": "correct"},
            {"text": "It depends on the mass of the satellite", "tag": "misconception_depends_on_mass"},
            {"text": "Negative work, because gravity pulls it inward while it moves forward", "tag": "misconception_negative_work"}
        ],
        "correct_index": 1,
        "concepts_tested": ["work", "circular_motion", "gravity"],
        "misconceptions_detected": {"0": "work_is_force_times_any_distance", "2": "work_in_orbit_depends_on_mass", "3": "inward_force_is_negative_work"}
    },
    {
        "domain_slug": "physics-fundamentals",
        "tier": 3,
        "stem": "Two identical speakers play the same pure tone (sound wave). As you walk between them, you hear the sound alternate between loud and quiet. This phenomenon is:",
        "options": [
            {"text": "The Doppler Effect", "tag": "misconception_doppler"},
            {"text": "Wave interference (constructive and destructive)", "tag": "correct"},
            {"text": "Resonance", "tag": "misconception_resonance"},
            {"text": "Refraction", "tag": "misconception_refraction"}
        ],
        "correct_index": 1,
        "concepts_tested": ["waves", "interference", "acoustics"],
        "misconceptions_detected": {"0": "volume_change_is_doppler", "2": "loud_spots_are_resonance", "3": "bending_sound_is_refraction"}
    },
    {
        "domain_slug": "physics-fundamentals",
        "tier": 3,
        "stem": "According to Special Relativity, if a spaceship travels past Earth at 90% the speed of light, an observer on Earth will see:",
        "options": [
            {"text": "Clocks on the spaceship running faster than Earth clocks", "tag": "misconception_time_dilation_faster"},
            {"text": "Clocks on the spaceship running slower than Earth clocks (Time Dilation)", "tag": "correct"},
            {"text": "The spaceship appearing longer than its rest length (Length Expansion)", "tag": "misconception_length_expansion"},
            {"text": "No difference in time or length, only a change in mass", "tag": "misconception_no_relativistic_effects"}
        ],
        "correct_index": 1,
        "concepts_tested": ["special_relativity", "time_dilation"],
        "misconceptions_detected": {"0": "moving_clocks_run_fast", "2": "length_expands_at_c", "3": "relativity_only_affects_mass"}
    },

    # =========================================================================
    # DOMAIN: chemistry-fundamentals (9 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 1,
        "stem": "What is a covalent bond?",
        "options": [
            {"text": "A bond formed by the complete transfer of electrons from one atom to another", "tag": "misconception_ionic"},
            {"text": "A bond formed by the sharing of electron pairs between nonmetal atoms", "tag": "correct"},
            {"text": "A bond formed by a sea of delocalized electrons around metal nuclei", "tag": "misconception_metallic"},
            {"text": "A weak attraction between molecules, like hydrogen bonding", "tag": "misconception_imf"}
        ],
        "correct_index": 1,
        "concepts_tested": ["chemical_bonding", "covalent_bonds"],
        "misconceptions_detected": {"0": "covalent_is_ionic", "2": "covalent_is_metallic", "3": "covalent_is_imf"}
    },
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 1,
        "stem": "What subatomic particle determines the elemental identity of an atom (e.g., carbon vs. oxygen)?",
        "options": [
            {"text": "Neutron", "tag": "misconception_neutron"},
            {"text": "Electron", "tag": "misconception_electron"},
            {"text": "Proton", "tag": "correct"},
            {"text": "Positron", "tag": "misconception_positron"}
        ],
        "correct_index": 2,
        "concepts_tested": ["atomic_structure", "protons", "elements"],
        "misconceptions_detected": {"0": "neutrons_determine_element", "1": "electrons_determine_element", "3": "positrons_determine_element"}
    },
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 1,
        "stem": "In a chemical reaction, the Law of Conservation of Mass dictates that:",
        "options": [
            {"text": "The volume of the products must equal the volume of the reactants", "tag": "misconception_conservation_of_volume"},
            {"text": "The mass of the products must equal the mass of the reactants", "tag": "correct"},
            {"text": "The number of molecules must remain constant", "tag": "misconception_conservation_of_molecules"},
            {"text": "Energy is released in the form of heat", "tag": "misconception_exothermic_assumption"}
        ],
        "correct_index": 1,
        "concepts_tested": ["conservation_of_mass", "chemical_reactions"],
        "misconceptions_detected": {"0": "mass_is_volume", "2": "molecules_are_conserved", "3": "mass_conservation_is_exothermic"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 2,
        "stem": "Why does water (H2O) have an unusually elevated boiling point for a molecule of its size?",
        "options": [
            {"text": "Because it contains strong ionic bonds", "tag": "misconception_ionic_water"},
            {"text": "Because it forms strong intermolecular hydrogen bonds between molecules", "tag": "correct"},
            {"text": "Because the covalent bonds between O and H are very difficult to break during boiling", "tag": "misconception_breaking_covalent"},
            {"text": "Because it is a nonpolar molecule", "tag": "misconception_nonpolar_water"}
        ],
        "correct_index": 1,
        "concepts_tested": ["intermolecular_forces", "hydrogen_bonding", "phase_changes"],
        "misconceptions_detected": {"0": "water_is_ionic", "2": "boiling_breaks_covalent_bonds", "3": "water_is_nonpolar"}
    },
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 2,
        "stem": "What is an 'isotope'?",
        "options": [
            {"text": "An atom that has gained or lost electrons, acquiring a charge", "tag": "misconception_ion"},
            {"text": "An atom with the same number of protons but a different number of neutrons", "tag": "correct"},
            {"text": "A molecule composed of identical atoms", "tag": "misconception_diatomic"},
            {"text": "A compound with the same chemical formula but different structural arrangement", "tag": "misconception_isomer"}
        ],
        "correct_index": 1,
        "concepts_tested": ["atomic_structure", "isotopes"],
        "misconceptions_detected": {"0": "isotope_is_ion", "2": "isotope_is_element", "3": "isotope_is_isomer"}
    },
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 2,
        "stem": "If a solution has a pH of 3, it is:",
        "options": [
            {"text": "Strongly basic", "tag": "misconception_high_ph_is_acid"},
            {"text": "Neutral", "tag": "misconception_ph3_neutral"},
            {"text": "Acidic, meaning it has a large concentration of H+ ions", "tag": "correct"},
            {"text": "Acidic, meaning it has a large concentration of OH- ions", "tag": "misconception_acid_is_oh"}
        ],
        "correct_index": 2,
        "concepts_tested": ["acids_and_bases", "ph_scale"],
        "misconceptions_detected": {"0": "low_ph_is_base", "1": "ph3_is_neutral", "3": "acid_is_hydroxide"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 3,
        "stem": "In the reaction N2(g) + 3H2(g) \u21cc 2NH3(g) + heat, how would increasing the temperature affect the system at equilibrium (Le Chatelier's Principle)?",
        "options": [
            {"text": "It would shift the equilibrium to the right, producing more NH3", "tag": "misconception_heat_drives_exo_forward"},
            {"text": "It would shift the equilibrium to the left, favoring the reactants (N2 and H2)", "tag": "correct"},
            {"text": "It would not affect the equilibrium position, only the reaction rate", "tag": "misconception_heat_only_rate"},
            {"text": "It would cause the system to stop reacting completely", "tag": "misconception_stops_reaction"}
        ],
        "correct_index": 1,
        "concepts_tested": ["le_chateliers_principle", "chemical_equilibrium", "exothermic_reactions"],
        "misconceptions_detected": {"0": "heating_exo_drives_forward", "2": "temp_does_not_shift_eq", "3": "temp_stops_reaction"}
    },
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 3,
        "stem": "You have 1 mole of carbon-12. How many carbon atoms do you have, and what is its mass?",
        "options": [
            {"text": "6.022 x 10^23 atoms; weighing exactly 1 gram", "tag": "misconception_mole_is_one_gram"},
            {"text": "6.022 x 10^23 atoms; weighing exactly 12 grams", "tag": "correct"},
            {"text": "12 atoms; weighing 12 atomic mass units (amu)", "tag": "misconception_mole_is_mass_number"},
            {"text": "Avogadro's number of atoms; weighing 1 kilogram", "tag": "misconception_kilogram_base"}
        ],
        "correct_index": 1,
        "concepts_tested": ["the_mole", "avogadros_number", "molar_mass"],
        "misconceptions_detected": {"0": "mole_always_weighs_1g", "2": "mole_means_atomic_number", "3": "molar_mass_in_kg"}
    },
    {
        "domain_slug": "chemistry-fundamentals",
        "tier": 3,
        "stem": "During a titration, you find that it takes exactly 50 mL of 0.1 M NaOH to neutralize 25 mL of an unknown HCl solution. What is the concentration of the HCl?",
        "options": [
            {"text": "0.1 M", "tag": "misconception_same_molarity"},
            {"text": "0.2 M", "tag": "correct"},
            {"text": "0.05 M", "tag": "misconception_inverted_ratio"},
            {"text": "0.4 M", "tag": "misconception_doubled_wrong"}
        ],
        "correct_index": 1,
        "concepts_tested": ["titration", "stoichiometry", "molarity"],
        "misconceptions_detected": {"0": "ignore_volume_ratio", "2": "invert_volume_ratio", "3": "double_volume_ratio_wrong"}
    },

    # =========================================================================
    # DOMAIN: biology-fundamentals (9 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "biology-fundamentals",
        "tier": 1,
        "stem": "What is the primary function of DNA in a cell?",
        "options": [
            {"text": "To provide energy for cellular processes", "tag": "misconception_dna_as_atp"},
            {"text": "To store and transmit genetic instructions for building proteins", "tag": "correct"},
            {"text": "To form the structural boundary of the cell membrane", "tag": "misconception_dna_as_membrane"},
            {"text": "To break down waste materials", "tag": "misconception_dna_as_lysosome"}
        ],
        "correct_index": 1,
        "concepts_tested": ["genetics", "dna_function"],
        "misconceptions_detected": {"0": "dna_is_energy", "2": "dna_is_structural", "3": "dna_is_lysosome"}
    },
    {
        "domain_slug": "biology-fundamentals",
        "tier": 1,
        "stem": "Which organelle is famously known as the 'powerhouse of the cell' because it generates most of the cell's ATP?",
        "options": [
            {"text": "Nucleus", "tag": "misconception_nucleus_power"},
            {"text": "Ribosome", "tag": "misconception_ribosome_power"},
            {"text": "Mitochondrion", "tag": "correct"},
            {"text": "Chloroplast", "tag": "misconception_chloroplast_power"}
        ],
        "correct_index": 2,
        "concepts_tested": ["cell_biology", "organelles", "mitochondria"],
        "misconceptions_detected": {"0": "nucleus_makes_energy", "1": "ribosome_makes_energy", "3": "chloroplast_in_all_cells"}
    },
    {
        "domain_slug": "biology-fundamentals",
        "tier": 1,
        "stem": "In natural selection, what dictates which organisms are most likely to survive and reproduce?",
        "options": [
            {"text": "The strongest and most aggressive individuals always survive", "tag": "misconception_survival_of_strongest"},
            {"text": "Individuals possessing traits best suited to the current environment", "tag": "correct"},
            {"text": "Organisms that adapt during their lifetime and pass those learned traits on", "tag": "misconception_lamarckian"},
            {"text": "Pure random chance", "tag": "misconception_pure_randomness"}
        ],
        "correct_index": 1,
        "concepts_tested": ["evolution", "natural_selection"],
        "misconceptions_detected": {"0": "fitness_equals_strength", "2": "lamarckian_evolution", "3": "evolution_is_purely_random"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "biology-fundamentals",
        "tier": 2,
        "stem": "During photosynthesis, plants convert light energy into chemical energy. What are the primary inputs (reactants) for this process?",
        "options": [
            {"text": "Oxygen and Glucose", "tag": "misconception_respiration_reactants"},
            {"text": "Carbon Dioxide and Water (along with sunlight)", "tag": "correct"},
            {"text": "Nitrogen and Soil", "tag": "misconception_plant_food_myth"},
            {"text": "ATP and Chlorophyll", "tag": "misconception_enzymes_as_reactants"}
        ],
        "correct_index": 1,
        "concepts_tested": ["photosynthesis", "metabolism"],
        "misconceptions_detected": {"0": "photosynthesis_vs_respiration", "2": "plants_eat_soil", "3": "catalysts_are_reactants"}
    },
    {
        "domain_slug": "biology-fundamentals",
        "tier": 2,
        "stem": "What is the key difference between mitosis and meiosis?",
        "options": [
            {"text": "Mitosis produces genetically identical diploid cells for growth; meiosis produces genetically distinct haploid cells (gametes) for reproduction", "tag": "correct"},
            {"text": "Mitosis occurs only in animal cells; meiosis occurs only in plant cells", "tag": "misconception_kingdom_split"},
            {"text": "Mitosis requires energy (ATP); meiosis does not", "tag": "misconception_energy_diff"},
            {"text": "Mitosis halves the number of chromosomes; meiosis keeps it the same", "tag": "misconception_reversed_definition"}
        ],
        "correct_index": 0,
        "concepts_tested": ["cell_division", "mitosis_vs_meiosis"],
        "misconceptions_detected": {"1": "mitosis_plant_animal", "2": "meiosis_no_energy", "3": "mitosis_meiosis_reversed"}
    },
    {
        "domain_slug": "biology-fundamentals",
        "tier": 2,
        "stem": "How do enzymes speed up chemical reactions in biological systems?",
        "options": [
            {"text": "By increasing the temperature of the cell", "tag": "misconception_heating_cell"},
            {"text": "By lowering the activation energy required for the reaction to proceed", "tag": "correct"},
            {"text": "By being permanently consumed as a reactant in the reaction", "tag": "misconception_enzyme_consumed"},
            {"text": "By changing the final equilibrium state of the products", "tag": "misconception_changes_equilibrium"}
        ],
        "correct_index": 1,
        "concepts_tested": ["enzymes", "biochemistry", "catalysis"],
        "misconceptions_detected": {"0": "enzymes_heat_things", "2": "enzymes_are_consumed", "3": "enzymes_change_equilibrium"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "biology-fundamentals",
        "tier": 3,
        "stem": "A patient is prescribed an antibiotic that targets bacterial ribosomes. Why does this cure the infection without harming the patient's own cells?",
        "options": [
            {"text": "Human cells do not have ribosomes", "tag": "misconception_humans_lack_ribosomes"},
            {"text": "Bacterial ribosomes (70S) are structurally different from eukaryotic human ribosomes (80S), allowing the drug to be extremely selective", "tag": "correct"},
            {"text": "The antibiotic only enters cells that have a cell wall", "tag": "misconception_cell_wall_entry"},
            {"text": "The patient's immune system protects their own ribosomes", "tag": "misconception_immune_protection"}
        ],
        "correct_index": 1,
        "concepts_tested": ["microbiology", "cellular_differences", "pharmacology"],
        "misconceptions_detected": {"0": "eukaryotes_lack_ribosomes", "2": "cell_wall_controls_all_drug_entry", "3": "immune_system_protects_organelles"}
    },
    {
        "domain_slug": "biology-fundamentals",
        "tier": 3,
        "stem": "In Mendelian genetics, a heterozygous tall plant (Tt) is crossed with a short plant (tt). What percentage of the offspring is expected to be short?",
        "options": [
            {"text": "0%", "tag": "misconception_dominant_always_wins"},
            {"text": "25%", "tag": "misconception_f1_cross_ratio"},
            {"text": "50%", "tag": "correct"},
            {"text": "75%", "tag": "misconception_dominant_ratio"}
        ],
        "correct_index": 2,
        "concepts_tested": ["genetics", "mendelian_inheritance", "punnett_squares"],
        "misconceptions_detected": {"0": "dominant_always_expressed_all", "1": "memorized_3_1_ratio_wrongly", "3": "reversed_recessive_dominant"}
    },
    {
        "domain_slug": "biology-fundamentals",
        "tier": 3,
        "stem": "If a mutation causes a single nucleotide insertion in a coding gene, what is the most likely consequence for the resulting protein?",
        "options": [
            {"text": "Only one amino acid will change, slightly altering the protein", "tag": "misconception_point_mutation"},
            {"text": "A frameshift will occur, changing the entire sequence of amino acids downstream of the mutation, usually resulting in a non-functional protein", "tag": "correct"},
            {"text": "The DNA will repair itself immediately", "tag": "misconception_perfect_repair"},
            {"text": "The cell will undergo immediate apoptosis (cell death) before the protein is made", "tag": "misconception_immediate_apoptosis"}
        ],
        "correct_index": 1,
        "concepts_tested": ["molecular_genetics", "mutations", "frameshift"],
        "misconceptions_detected": {"0": "insertion_is_substitution", "2": "dna_repair_is_infallible", "3": "all_mutations_cause_immediate_death"}
    },

    # =========================================================================
    # DOMAIN: cloud-computing (9 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "cloud-computing",
        "tier": 1,
        "stem": "Which cloud service model provides a fully managed environment for developers to build and deploy applications without managing the underlying infrastructure?",
        "options": [
            {"text": "IaaS (Infrastructure as a Service)", "tag": "misconception_iaas"},
            {"text": "PaaS (Platform as a Service)", "tag": "correct"},
            {"text": "SaaS (Software as a Service)", "tag": "misconception_saas"},
            {"text": "DaaS (Desktop as a Service)", "tag": "misconception_daas"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cloud_service_models", "paas"],
        "misconceptions_detected": {"0": "iaas_vs_paas", "2": "saas_vs_paas", "3": "daas_confusion"}
    },
    {
        "domain_slug": "cloud-computing",
        "tier": 1,
        "stem": "What is the primary benefit of 'elasticity' in cloud computing?",
        "options": [
            {"text": "The ability to permanently store infinite amounts of data", "tag": "misconception_storage"},
            {"text": "The ability to automatically scale computing resources up or down based on current demand", "tag": "correct"},
            {"text": "The ability to transfer data between different cloud providers without fees", "tag": "misconception_portability"},
            {"text": "The ability to run multiple operating systems on a single physical server", "tag": "misconception_virtualization"}
        ],
        "correct_index": 1,
        "concepts_tested": ["elasticity", "auto_scaling"],
        "misconceptions_detected": {"0": "elasticity_as_storage", "2": "elasticity_as_portability", "3": "elasticity_as_virtualization"}
    },
    {
        "domain_slug": "cloud-computing",
        "tier": 1,
        "stem": "What is an AWS S3 bucket (or GCP Cloud Storage) primarily used for?",
        "options": [
            {"text": "Running virtual machines", "tag": "misconception_compute"},
            {"text": "Hosting relational databases like MySQL", "tag": "misconception_rdbms"},
            {"text": "Storing unstructured object data like images, videos, and backups", "tag": "correct"},
            {"text": "Managing network routing and DNS", "tag": "misconception_networking"}
        ],
        "correct_index": 2,
        "concepts_tested": ["object_storage", "s3"],
        "misconceptions_detected": {"0": "storage_as_compute", "1": "object_storage_as_rdbms", "3": "storage_as_networking"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "cloud-computing",
        "tier": 2,
        "stem": "When designing a resilient cloud architecture, why should resources be distributed across multiple Availability Zones (AZs)?",
        "options": [
            {"text": "To decrease latency for users spread across different continents", "tag": "misconception_regions"},
            {"text": "To ensure the application remains available even if a single physical data center fails", "tag": "correct"},
            {"text": "To increase the maximum storage capacity of a database", "tag": "misconception_capacity"},
            {"text": "To separate development environments from production environments", "tag": "misconception_environments"}
        ],
        "correct_index": 1,
        "concepts_tested": ["high_availability", "availability_zones"],
        "misconceptions_detected": {"0": "az_vs_regions", "2": "az_for_capacity", "3": "az_for_environments"}
    },
    {
        "domain_slug": "cloud-computing",
        "tier": 2,
        "stem": "How does 'serverless' computing (like AWS Lambda) differ from traditional VM hosting?",
        "options": [
            {"text": "Serverless runs on the client's browser, not on cloud servers", "tag": "misconception_client_side"},
            {"text": "Serverless computing still uses servers, but the cloud provider dynamically manages the allocation and provisioning of those servers, billing only for compute time used", "tag": "correct"},
            {"text": "Serverless architectures do not require any backend code; they only use APIs", "tag": "misconception_no_code"},
            {"text": "Serverless guarantees zero latency since code is pre-loaded everywhere", "tag": "misconception_zero_latency"}
        ],
        "correct_index": 1,
        "concepts_tested": ["serverless", "event_driven_compute"],
        "misconceptions_detected": {"0": "serverless_as_client_side", "2": "serverless_as_no_code", "3": "serverless_zero_latency"}
    },
    {
        "domain_slug": "cloud-computing",
        "tier": 2,
        "stem": "What is Infrastructure as Code (IaC)?",
        "options": [
            {"text": "Writing application code directly on the production server", "tag": "misconception_direct_editing"},
            {"text": "Managing and provisioning computing infrastructure through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools", "tag": "correct"},
            {"text": "A specialized programming language used exclusively to build hardware components", "tag": "misconception_hardware_language"},
            {"text": "The process of compiling source code into an executable binary in the cloud", "tag": "misconception_compilation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["infrastructure_as_code", "automation"],
        "misconceptions_detected": {"0": "iac_as_direct_editing", "2": "iac_as_hardware_design", "3": "iac_as_compilation"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "cloud-computing",
        "tier": 3,
        "stem": "You are migrating a monolithic application to a microservices architecture in the cloud. Which pattern helps ensure that a failure in one service (e.g., email notification) doesn't cause the calling service (e.g., checkout) to fail entirely?",
        "options": [
            {"text": "Tight Coupling", "tag": "misconception_tight_coupling"},
            {"text": "Circuit Breaker pattern", "tag": "correct"},
            {"text": "Two-Phase Commit", "tag": "misconception_two_phase_commit"},
            {"text": "Consistent Hashing", "tag": "misconception_consistent_hashing"}
        ],
        "correct_index": 1,
        "concepts_tested": ["microservices", "resilience_patterns", "circuit_breaker"],
        "misconceptions_detected": {"0": "tight_coupling_is_bad", "2": "two_phase_commit_for_resilience", "3": "hashing_for_resilience"}
    },
    {
        "domain_slug": "cloud-computing",
        "tier": 3,
        "stem": "Your stateless web application experiences extremely variable traffic. You set up Auto Scaling to handle spikes. What is a common pitfall that could prevent the scaling from being effective?",
        "options": [
            {"text": "Using a Load Balancer, which slows down the scaling process", "tag": "misconception_lb_slows_scaling"},
            {"text": "Basing the scaling trigger on long-term daily averages rather than real-time metrics (like current CPU utilization or request queue length)", "tag": "correct"},
            {"text": "Making the application stateless, which requires scaling the database instead", "tag": "misconception_stateless_bad"},
            {"text": "Using too many Availability Zones, causing network delays during scaling", "tag": "misconception_az_scaling_delay"}
        ],
        "correct_index": 1,
        "concepts_tested": ["auto_scaling_policies", "metrics", "cloud_architecture"],
        "misconceptions_detected": {"0": "lb_is_bad_for_scaling", "2": "stateless_is_bad_for_scaling", "3": "az_causes_scaling_delay"}
    },
    {
        "domain_slug": "cloud-computing",
        "tier": 3,
        "stem": "In a cloud environment, you need to store temporary session data that must be accessed extremely quickly (sub-millisecond) across multiple web servers. Which managed service is most appropriate?",
        "options": [
            {"text": "A managed Relational Database Service (like Amazon RDS)", "tag": "misconception_rds_for_sessions"},
            {"text": "A managed Object Store (like Amazon S3)", "tag": "misconception_s3_for_sessions"},
            {"text": "A managed In-Memory Data Store (like Amazon ElastiCache / Redis)", "tag": "correct"},
            {"text": "A managed Data Warehouse (like Amazon Redshift)", "tag": "misconception_redshift_for_sessions"}
        ],
        "correct_index": 2,
        "concepts_tested": ["caching", "in_memory_databases", "cloud_services"],
        "misconceptions_detected": {"0": "rdbms_for_fast_cache", "1": "object_store_for_fast_cache", "3": "data_warehouse_for_cache"}
    },

    # =========================================================================
    # DOMAIN: mobile-development (9 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "mobile-development",
        "tier": 1,
        "stem": "What is the primary difference between a Native mobile app and a Cross-Platform mobile app?",
        "options": [
            {"text": "Native apps run only on tablets; cross-platform apps run on phones", "tag": "misconception_device_type"},
            {"text": "Native apps are built specifically for one OS (e.g., Swift for iOS); cross-platform apps use one codebase for multiple OSs (e.g., React Native)", "tag": "correct"},
            {"text": "Native apps require an internet connection; cross-platform apps work offline", "tag": "misconception_offline"},
            {"text": "Native apps are always free; cross-platform apps are paid", "tag": "misconception_pricing"}
        ],
        "correct_index": 1,
        "concepts_tested": ["app_types", "native_vs_cross_platform"],
        "misconceptions_detected": {"0": "native_is_tablet", "2": "native_requires_internet", "3": "native_is_free"}
    },
    {
        "domain_slug": "mobile-development",
        "tier": 1,
        "stem": "Which programming language is officially recommended by Google for modern Android development?",
        "options": [
            {"text": "Objective-C", "tag": "misconception_objective_c"},
            {"text": "Swift", "tag": "misconception_swift"},
            {"text": "Kotlin", "tag": "correct"},
            {"text": "Ruby", "tag": "misconception_ruby"}
        ],
        "correct_index": 2,
        "concepts_tested": ["android_development", "kotlin"],
        "misconceptions_detected": {"0": "ios_lang_for_android", "1": "ios_lang_for_android_2", "3": "web_lang_for_android"}
    },
    {
        "domain_slug": "mobile-development",
        "tier": 1,
        "stem": "What is the purpose of an App Manifest file (e.g., AndroidManifest.xml or Info.plist)?",
        "options": [
            {"text": "To store the application's source code", "tag": "misconception_source_code"},
            {"text": "To define the app's visual layout and UI components", "tag": "misconception_layout"},
            {"text": "To declare essential information about the app to the OS, such as permissions and entry points", "tag": "correct"},
            {"text": "To manage the app's local database schemas", "tag": "misconception_database"}
        ],
        "correct_index": 2,
        "concepts_tested": ["app_manifest", "mobile_architecture"],
        "misconceptions_detected": {"0": "manifest_as_code", "1": "manifest_as_layout", "3": "manifest_as_database"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "mobile-development",
        "tier": 2,
        "stem": "In mobile development, what is the 'Main Thread' (or UI Thread) responsible for?",
        "options": [
            {"text": "Handling heavy background computations and network requests", "tag": "misconception_background_work"},
            {"text": "Executing all database queries to ensure data consistency", "tag": "misconception_db_work"},
            {"text": "Updating the user interface and handling user interactions", "tag": "correct"},
            {"text": "Managing the application's memory and garbage collection", "tag": "misconception_memory_management"}
        ],
        "correct_index": 2,
        "concepts_tested": ["threading", "main_thread", "ui_responsiveness"],
        "misconceptions_detected": {"0": "main_thread_for_background", "1": "main_thread_for_db", "3": "main_thread_for_gc"}
    },
    {
        "domain_slug": "mobile-development",
        "tier": 2,
        "stem": "What problem does the 'ViewHolder' pattern (in Android) or similar cell reuse mechanisms (in iOS) solve?",
        "options": [
            {"text": "They encrypt user data stored in the app's local cache", "tag": "misconception_encryption"},
            {"text": "They improve scrolling performance by reusing view instances instead of creating new ones for every item in a long list", "tag": "correct"},
            {"text": "They manage user authentication states across different screens", "tag": "misconception_auth"},
            {"text": "They automatically translate the app's text into different languages", "tag": "misconception_localization"}
        ],
        "correct_index": 1,
        "concepts_tested": ["list_performance", "view_recycling"],
        "misconceptions_detected": {"0": "viewholder_as_encryption", "2": "viewholder_as_auth", "3": "viewholder_as_localization"}
    },
    {
        "domain_slug": "mobile-development",
        "tier": 2,
        "stem": "How does React Native achieve cross-platform capability?",
        "options": [
            {"text": "It compiles JavaScript directly into native machine code for both iOS and Android", "tag": "misconception_direct_compilation"},
            {"text": "It runs JavaScript in a background thread and communicates with native UI components via a bridge", "tag": "correct"},
            {"text": "It renders a web page (HTML/CSS) inside a hidden WebView component on the device", "tag": "misconception_webview"},
            {"text": "It requires developers to write all UI code in C++ which is shared across platforms", "tag": "misconception_cpp"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cross_platform", "react_native_architecture"],
        "misconceptions_detected": {"0": "rn_compiles_to_native", "2": "rn_is_webview", "3": "rn_is_cpp"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "mobile-development",
        "tier": 3,
        "stem": "Your mobile app crashes because of an OutOfMemoryError (OOM) when displaying a grid of maximum-resolution photos. What is the standard approach to fix this?",
        "options": [
            {"text": "Request a larger heap size in the manifest and disable garbage collection", "tag": "misconception_large_heap"},
            {"text": "Downsample the images to match the view size before loading them into memory and use an image caching library", "tag": "correct"},
            {"text": "Move the image loading code from a background thread to the Main Thread", "tag": "misconception_main_thread"},
            {"text": "Save the images to an SQLite database instead of displaying them directly", "tag": "misconception_sqlite_images"}
        ],
        "correct_index": 1,
        "concepts_tested": ["memory_management", "image_caching", "oom_prevention"],
        "misconceptions_detected": {"0": "large_heap_fixes_oom", "2": "main_thread_fixes_oom", "3": "db_fixes_memory"}
    },
    {
        "domain_slug": "mobile-development",
        "tier": 3,
        "stem": "You are implementing offline support for an app. Users need to read and edit data without an internet connection, and changes should sync when they reconnect. Which architecture best supports this?",
        "options": [
            {"text": "Rely entirely on in-memory variables and push them to the server when connected", "tag": "misconception_in_memory"},
            {"text": "Use a local database (like Room/SQLite or CoreData) as the single source of truth, and a background sync manager to reconcile changes with the remote server", "tag": "correct"},
            {"text": "Use SharedPreferences or UserDefaults to store all the app's complex relational data", "tag": "misconception_shared_prefs"},
            {"text": "Require the user to manually click a 'Save Offline' button for every action", "tag": "misconception_manual_save"}
        ],
        "correct_index": 1,
        "concepts_tested": ["offline_first", "local_storage", "sync_strategies"],
        "misconceptions_detected": {"0": "in_memory_for_offline", "2": "key_value_for_relational_data", "3": "manual_offline_management"}
    },
    {
        "domain_slug": "mobile-development",
        "tier": 3,
        "stem": "In iOS development (SwiftUI/Combine) or Android (Kotlin Flows/LiveData), what is the core architectural principle for handling data changes?",
        "options": [
            {"text": "The UI components should regularly poll the database every second to check for updates", "tag": "misconception_polling"},
            {"text": "The UI strictly observes a state holder (ViewModel); when the data changes, the UI automatically reacts and re-renders", "tag": "correct"},
            {"text": "The database should have direct references to UI elements and call their update methods", "tag": "misconception_tight_coupling"},
            {"text": "Data changes should only be handled via explicit user button presses", "tag": "misconception_manual_refresh"}
        ],
        "correct_index": 1,
        "concepts_tested": ["reactive_programming", "mvvm", "state_management"],
        "misconceptions_detected": {"0": "polling_for_updates", "2": "db_knows_ui", "3": "no_reactive_updates"}
    },

    # =========================================================================
    # DOMAIN: game-development (9 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "game-development",
        "tier": 1,
        "stem": "What is the primary function of a 'Game Loop' in game development?",
        "options": [
            {"text": "To continuously play the background music without stopping", "tag": "misconception_audio_loop"},
            {"text": "To repeatedly process user input, update the game state, and render the graphics", "tag": "correct"},
            {"text": "To automatically restart the level when the player dies", "tag": "misconception_level_restart"},
            {"text": "To cycle through different advertisements in free-to-play games", "tag": "misconception_ad_loop"}
        ],
        "correct_index": 1,
        "concepts_tested": ["game_loop", "architecture"],
        "misconceptions_detected": {"0": "game_loop_is_audio", "2": "game_loop_is_restart", "3": "game_loop_is_ads"}
    },
    {
        "domain_slug": "game-development",
        "tier": 1,
        "stem": "In 3D graphics, what is a 'mesh'?",
        "options": [
            {"text": "A network connection between multiple players in a multiplayer game", "tag": "misconception_networking"},
            {"text": "The 2D image wrapped around a 3D object to give it color and detail", "tag": "misconception_texture"},
            {"text": "A collection of vertices, edges, and faces that defines the shape of a 3D object", "tag": "correct"},
            {"text": "The invisible boundary used to detect when two objects crash into each other", "tag": "misconception_collider"}
        ],
        "correct_index": 2,
        "concepts_tested": ["3d_modeling", "mesh"],
        "misconceptions_detected": {"0": "mesh_as_network", "1": "mesh_as_texture", "3": "mesh_as_collider"}
    },
    {
        "domain_slug": "game-development",
        "tier": 1,
        "stem": "What does a 'Collider' component do in a game engine like Unity or Unreal?",
        "options": [
            {"text": "It calculates the complex lighting bounces off a surface", "tag": "misconception_lighting"},
            {"text": "It defines the physical boundaries of an object for the physics engine to detect intersections", "tag": "correct"},
            {"text": "It combines multiple small textures into one large texture atlas", "tag": "misconception_texture_packing"},
            {"text": "It smoothly blends two animations together", "tag": "misconception_animation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["physics_engine", "colliders"],
        "misconceptions_detected": {"0": "collider_is_lighting", "2": "collider_is_textures", "3": "collider_is_animation"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "game-development",
        "tier": 2,
        "stem": "Why is 'Delta Time' (deltaTime) crucial when updating object movement in a game?",
        "options": [
            {"text": "It ensures the game runs at a fixed 60 frames per second regardless of hardware", "tag": "misconception_fixed_fps"},
            {"text": "It prevents the physics engine from calculating gravity incorrectly", "tag": "misconception_gravity"},
            {"text": "It makes movement frame-rate independent by multiplying speed by the time elapsed since the last frame", "tag": "correct"},
            {"text": "It synchronizes the local player's clock with the multiplayer server's clock", "tag": "misconception_server_sync"}
        ],
        "correct_index": 2,
        "concepts_tested": ["delta_time", "frame_rate_independence"],
        "misconceptions_detected": {"0": "delta_time_fixes_fps", "1": "delta_time_is_gravity", "3": "delta_time_is_networking"}
    },
    {
        "domain_slug": "game-development",
        "tier": 2,
        "stem": "What is the purpose of 'Raycasting' in a game?",
        "options": [
            {"text": "To render extremely realistic reflections and refractions on surfaces", "tag": "misconception_raytracing"},
            {"text": "To shoot an invisible line through the scene to detect objects it intersects with (e.g., for shooting mechanics or line-of-sight)", "tag": "correct"},
            {"text": "To broadcast a message to all active scripts in the scene", "tag": "misconception_broadcasting"},
            {"text": "To optimize rendering by ignoring objects outside the camera's view", "tag": "misconception_frustum_culling"}
        ],
        "correct_index": 1,
        "concepts_tested": ["raycasting", "physics_queries"],
        "misconceptions_detected": {"0": "raycasting_is_raytracing", "2": "raycasting_is_messaging", "3": "raycasting_is_culling"}
    },
    {
        "domain_slug": "game-development",
        "tier": 2,
        "stem": "What does 'Object Pooling' achieve in game development?",
        "options": [
            {"text": "It improves performance by reusing a fixed number of deactivated objects instead of constantly instantiating and destroying them", "tag": "correct"},
            {"text": "It combines all 3D meshes in a scene into a single large pool for faster rendering", "tag": "misconception_mesh_combining"},
            {"text": "It groups players of similar skill levels together in multiplayer matchmaking", "tag": "misconception_matchmaking"},
            {"text": "It allows multiple developers to work on the same scene file simultaneously", "tag": "misconception_version_control"}
        ],
        "correct_index": 0,
        "concepts_tested": ["object_pooling", "performance_optimization", "memory_management"],
        "misconceptions_detected": {"1": "pooling_as_batching", "2": "pooling_as_matchmaking", "3": "pooling_as_git"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "game-development",
        "tier": 3,
        "stem": "You are building a pathfinding system for an enemy AI on a grid-based map. Which algorithm is most commonly used to find the shortest path while considering obstacles?",
        "options": [
            {"text": "Depth-First Search (DFS)", "tag": "misconception_dfs"},
            {"text": "A* (A-Star)", "tag": "correct"},
            {"text": "K-Nearest Neighbors (KNN)", "tag": "misconception_knn"},
            {"text": "Quicksort", "tag": "misconception_sorting"}
        ],
        "correct_index": 1,
        "concepts_tested": ["pathfinding", "a_star", "ai"],
        "misconceptions_detected": {"0": "dfs_for_shortest_path", "2": "knn_for_pathfinding", "3": "sorting_for_pathfinding"}
    },
    {
        "domain_slug": "game-development",
        "tier": 3,
        "stem": "In rendering optimization, what is a 'Draw Call' and why do developers try to minimize them?",
        "options": [
            {"text": "It's the function that updates the UI text; minimizing it saves memory", "tag": "misconception_ui_text"},
            {"text": "It's a command sent from the CPU to the GPU to draw a mesh; too many cause CPU bottlenecks and drop the frame rate", "tag": "correct"},
            {"text": "It's the process of drawing concept art; minimizing it saves development time", "tag": "misconception_concept_art"},
            {"text": "It's a network request for player data; minimizing it reduces server lag", "tag": "misconception_network_call"}
        ],
        "correct_index": 1,
        "concepts_tested": ["rendering_pipeline", "draw_calls", "optimization"],
        "misconceptions_detected": {"0": "draw_call_is_ui", "2": "draw_call_is_art", "3": "draw_call_is_network"}
    },
    {
        "domain_slug": "game-development",
        "tier": 3,
        "stem": "When implementing a multiplayer action game using an authoritative server model, how do you prevent the local player's movement from feeling laggy while waiting for server confirmation?",
        "options": [
            {"text": "Trust the client completely and remove the authoritative server", "tag": "misconception_trust_client"},
            {"text": "Use Client-Side Prediction, where the local game simulates movement immediately and reconciles later if the server disagrees", "tag": "correct"},
            {"text": "Increase the server's tick rate to 1000Hz so confirmation is instantaneous", "tag": "misconception_infinite_tickrate"},
            {"text": "Disable gravity and physics calculations to speed up the network packets", "tag": "misconception_disable_physics"}
        ],
        "correct_index": 1,
        "concepts_tested": ["networking", "client_side_prediction", "multiplayer_architecture"],
        "misconceptions_detected": {"0": "trust_client_in_auth_model", "2": "tickrate_solves_latency", "3": "physics_slows_packets"}
    },

    # =========================================================================
    # DOMAIN: cybersecurity (9 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "cybersecurity",
        "tier": 1,
        "stem": "What is the primary purpose of a firewall in network security?",
        "options": [
            {"text": "To encrypt all data leaving the network", "tag": "misconception_encryption"},
            {"text": "To filter incoming and outgoing network traffic based on predetermined security rules", "tag": "correct"},
            {"text": "To detect and remove viruses from infected computers", "tag": "misconception_antivirus"},
            {"text": "To back up sensitive data to secure offsite servers", "tag": "misconception_backup"}
        ],
        "correct_index": 1,
        "concepts_tested": ["network_security", "firewalls"],
        "misconceptions_detected": {"0": "firewall_as_encryption", "2": "firewall_as_antivirus", "3": "firewall_as_backup"}
    },
    {
        "domain_slug": "cybersecurity",
        "tier": 1,
        "stem": "Which of the following best describes phishing?",
        "options": [
            {"text": "A brute-force attack to guess passwords", "tag": "misconception_brute_force"},
            {"text": "Intercepting data packets on a public Wi-Fi network", "tag": "misconception_sniffing"},
            {"text": "Exploiting a vulnerability in a web application's database", "tag": "misconception_sql_injection"},
            {"text": "Fraudulent communication designed to trick a person into revealing sensitive information", "tag": "correct"}
        ],
        "correct_index": 3,
        "concepts_tested": ["social_engineering", "phishing"],
        "misconceptions_detected": {"0": "phishing_as_brute_force", "1": "phishing_as_sniffing", "2": "phishing_as_injection"}
    },
    {
        "domain_slug": "cybersecurity",
        "tier": 1,
        "stem": "In the CIA triad, what does 'Integrity' ensure?",
        "options": [
            {"text": "Data is only accessible to authorized users", "tag": "misconception_confidentiality"},
            {"text": "Data remains accurate, consistent, and unaltered by unauthorized parties", "tag": "correct"},
            {"text": "Services and data are always available when needed", "tag": "misconception_availability"},
            {"text": "Users are verified through multi-factor authentication", "tag": "misconception_authentication"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cia_triad", "integrity"],
        "misconceptions_detected": {"0": "integrity_vs_confidentiality", "2": "integrity_vs_availability", "3": "integrity_vs_auth"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "cybersecurity",
        "tier": 2,
        "stem": "What is the key difference between symmetric and asymmetric encryption?",
        "options": [
            {"text": "Symmetric encryption is only used for data at rest, asymmetric for data in transit", "tag": "misconception_use_case"},
            {"text": "Symmetric encryption uses the same key for encryption and decryption; asymmetric uses a public/private key pair", "tag": "correct"},
            {"text": "Symmetric encryption cannot be broken, while asymmetric encryption is vulnerable to brute force", "tag": "misconception_unbreakable"},
            {"text": "Asymmetric encryption is significantly faster than symmetric encryption", "tag": "misconception_speed"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cryptography", "symmetric_vs_asymmetric"],
        "misconceptions_detected": {"0": "encryption_type_by_transit_state", "2": "symmetric_unbreakable", "3": "asymmetric_is_faster"}
    },
    {
        "domain_slug": "cybersecurity",
        "tier": 2,
        "stem": "How does a Cross-Site Scripting (XSS) attack typically compromise a web application?",
        "options": [
            {"text": "By executing arbitrary SQL commands on the backend database", "tag": "misconception_sql_injection"},
            {"text": "By overwhelming the server with requests to cause a denial of service", "tag": "misconception_ddos"},
            {"text": "By injecting malicious client-side scripts into web pages viewed by other users", "tag": "correct"},
            {"text": "By tricking the server into making unauthorized requests to internal resources", "tag": "misconception_ssrf"}
        ],
        "correct_index": 2,
        "concepts_tested": ["web_vulnerabilities", "xss"],
        "misconceptions_detected": {"0": "xss_vs_sqli", "1": "xss_vs_ddos", "3": "xss_vs_ssrf"}
    },
    {
        "domain_slug": "cybersecurity",
        "tier": 2,
        "stem": "What is the purpose of 'salting' a password before hashing?",
        "options": [
            {"text": "To compress the password so it takes up less space in the database", "tag": "misconception_compression"},
            {"text": "To encrypt the hash so it can be decrypted later if the user forgets their password", "tag": "misconception_reversible_hash"},
            {"text": "To add random data to the password, ensuring identical passwords yield different hashes, thwarting rainbow table attacks", "tag": "correct"},
            {"text": "To enforce complexity requirements (e.g., uppercase, numbers) on the user's password", "tag": "misconception_complexity"}
        ],
        "correct_index": 2,
        "concepts_tested": ["password_security", "hashing", "salting"],
        "misconceptions_detected": {"0": "salting_as_compression", "1": "hashing_as_encryption", "3": "salting_as_policy"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "cybersecurity",
        "tier": 3,
        "stem": "You discover a vulnerability where an application deserializes untrusted data without validation. What is the most severe potential consequence?",
        "options": [
            {"text": "Remote Code Execution (RCE), allowing the attacker to run arbitrary commands on the server", "tag": "correct"},
            {"text": "Information Disclosure, leaking the source code of the application", "tag": "misconception_info_disclosure"},
            {"text": "Cross-Site Request Forgery (CSRF), allowing the attacker to forge user requests", "tag": "misconception_csrf"},
            {"text": "Denial of Service due to large serialized objects crashing the memory", "tag": "misconception_dos_only"}
        ],
        "correct_index": 0,
        "concepts_tested": ["insecure_deserialization", "rce", "owasp_top_10"],
        "misconceptions_detected": {"1": "deserialization_just_leaks_code", "2": "deserialization_is_csrf", "3": "deserialization_only_dos"}
    },
    {
        "domain_slug": "cybersecurity",
        "tier": 3,
        "stem": "When designing a Zero Trust Architecture, which principle must be applied to network traffic?",
        "options": [
            {"text": "Traffic inside the corporate VPN is implicitly trusted; external traffic is verified", "tag": "misconception_perimeter_trust"},
            {"text": "Verify explicitly—all traffic, regardless of origin, must be authenticated and authorized before granting access", "tag": "correct"},
            {"text": "All internal servers must use symmetric encryption to communicate with each other", "tag": "misconception_symmetric_only"},
            {"text": "Microsegmentation should be avoided to prevent latency issues", "tag": "misconception_avoid_microsegmentation"}
        ],
        "correct_index": 1,
        "concepts_tested": ["zero_trust", "network_architecture"],
        "misconceptions_detected": {"0": "perimeter_based_security", "2": "zero_trust_is_just_encryption", "3": "microsegmentation_is_bad"}
    },
    {
        "domain_slug": "cybersecurity",
        "tier": 3,
        "stem": "A system uses JWT (JSON Web Tokens) for session management. An attacker modifies the payload to elevate privileges, but leaves the signature intact. The server accepts it. What is the most likely flaw?",
        "options": [
            {"text": "The JWT was not encrypted using TLS", "tag": "misconception_tls_jwt"},
            {"text": "The server is vulnerable to Cross-Site Scripting (XSS)", "tag": "misconception_xss_jwt"},
            {"text": "The server failed to verify the cryptographic signature of the token before processing the payload", "tag": "correct"},
            {"text": "The token expiration time (exp) was set too far in the future", "tag": "misconception_token_expiry"}
        ],
        "correct_index": 2,
        "concepts_tested": ["jwt_security", "session_management", "cryptographic_verification"],
        "misconceptions_detected": {"0": "tls_protects_against_tampering", "1": "xss_causes_signature_bypass", "3": "expiry_prevents_tampering"}
    },

    # =========================================================================
    # DOMAIN: probability-statistics (15 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "probability-statistics",
        "tier": 1,
        "stem": "A fair coin is flipped 100 times. What is the expected number of heads?",
        "options": [
            {"text": "100", "tag": "misconception_certainty"},
            {"text": "50", "tag": "correct"},
            {"text": "It depends on the sequence", "tag": "misconception_gambler_fallacy"},
            {"text": "Cannot be determined", "tag": "misconception_uncertainty_aversion"}
        ],
        "correct_index": 1,
        "concepts_tested": ["expected_value", "probability_basics"],
        "misconceptions_detected": {"0": "deterministic_thinking", "2": "gambler_fallacy", "3": "uncertainty_aversion"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 1,
        "stem": "What does the standard deviation of a dataset measure?",
        "options": [
            {"text": "The middle value of the dataset", "tag": "misconception_median_confusion"},
            {"text": "How spread out the values are from the mean", "tag": "correct"},
            {"text": "The most common value", "tag": "misconception_mode_confusion"},
            {"text": "The range between max and min", "tag": "misconception_range_confusion"}
        ],
        "correct_index": 1,
        "concepts_tested": ["standard_deviation", "descriptive_statistics"],
        "misconceptions_detected": {"0": "median_vs_std", "2": "mode_vs_std", "3": "range_vs_std"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 1,
        "stem": "If event A has probability 0.3 and event B has probability 0.5, and they are independent, what is P(A and B)?",
        "options": [
            {"text": "0.8", "tag": "misconception_addition_rule"},
            {"text": "0.15", "tag": "correct"},
            {"text": "0.2", "tag": "misconception_subtraction"},
            {"text": "Cannot determine without more information", "tag": "misconception_independence_misunderstanding"}
        ],
        "correct_index": 1,
        "concepts_tested": ["independence", "multiplication_rule"],
        "misconceptions_detected": {"0": "addition_instead_of_multiplication", "3": "independence_misunderstanding"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 1,
        "stem": "In a normal distribution, approximately what percentage of data falls within one standard deviation of the mean?",
        "options": [
            {"text": "50%", "tag": "misconception_half"},
            {"text": "68%", "tag": "correct"},
            {"text": "95%", "tag": "misconception_two_sigma"},
            {"text": "99.7%", "tag": "misconception_three_sigma"}
        ],
        "correct_index": 1,
        "concepts_tested": ["normal_distribution", "empirical_rule"],
        "misconceptions_detected": {"0": "confuse_median_with_sigma", "2": "confuse_one_sigma_with_two", "3": "confuse_one_sigma_with_three"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 1,
        "stem": "You roll two dice. What is the probability that the sum is 7?",
        "options": [
            {"text": "1/12", "tag": "misconception_simple_fraction"},
            {"text": "7/36", "tag": "misconception_numerator_is_sum"},
            {"text": "1/6", "tag": "correct"},
            {"text": "1/7", "tag": "misconception_inverse_of_sum"}
        ],
        "correct_index": 2,
        "concepts_tested": ["combinatorics", "sample_space"],
        "misconceptions_detected": {"0": "wrong_sample_space", "1": "numerator_confusion", "3": "inverse_thinking"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "probability-statistics",
        "tier": 2,
        "stem": "A p-value of 0.03 means:",
        "options": [
            {"text": "There is a 3% probability that the null hypothesis is true", "tag": "misconception_p_as_posterior"},
            {"text": "If the null hypothesis were true, there is a 3% chance of observing data this extreme or more", "tag": "correct"},
            {"text": "The experiment has a 97% chance of being correct", "tag": "misconception_confidence_inversion"},
            {"text": "The effect size is 0.03", "tag": "misconception_effect_size"}
        ],
        "correct_index": 1,
        "concepts_tested": ["p_value_interpretation", "hypothesis_testing"],
        "misconceptions_detected": {"0": "p_value_as_posterior_probability", "2": "confidence_vs_probability", "3": "p_value_vs_effect_size"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 2,
        "stem": "You test a new drug on 20 patients and find p < 0.05. You then test the same drug on 2000 patients and find p < 0.05 with a smaller effect size. Which finding is more convincing?",
        "options": [
            {"text": "The first study, because the p-value was also significant", "tag": "misconception_p_value_equality"},
            {"text": "Both are equally convincing since both are statistically significant", "tag": "misconception_binary_significance"},
            {"text": "The second study, because larger samples give more reliable estimates", "tag": "correct"},
            {"text": "Neither, because the effect size decreased", "tag": "misconception_effect_size_only"}
        ],
        "correct_index": 2,
        "concepts_tested": ["sample_size", "statistical_power", "effect_size_vs_significance"],
        "misconceptions_detected": {"0": "p_value_equality", "1": "binary_significance_thinking", "3": "ignoring_sample_reliability"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 2,
        "stem": "Bayes' theorem allows you to:",
        "options": [
            {"text": "Calculate the probability of future events from past frequencies", "tag": "misconception_frequentist_only"},
            {"text": "Update your belief about a hypothesis given new evidence", "tag": "correct"},
            {"text": "Determine if two events are independent", "tag": "misconception_independence_test"},
            {"text": "Find the exact probability of rare events", "tag": "misconception_exact_rare"}
        ],
        "correct_index": 1,
        "concepts_tested": ["bayes_theorem", "bayesian_reasoning", "prior_posterior"],
        "misconceptions_detected": {"0": "frequentist_only_thinking", "2": "bayes_as_independence_test", "3": "bayes_as_rare_event_tool"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 2,
        "stem": "The Central Limit Theorem states that:",
        "options": [
            {"text": "All datasets are normally distributed if they are large enough", "tag": "misconception_data_normality"},
            {"text": "The sampling distribution of the sample mean approaches a normal distribution as sample size increases", "tag": "correct"},
            {"text": "The mean of any distribution equals its median for large samples", "tag": "misconception_mean_equals_median"},
            {"text": "Outliers disappear with enough data", "tag": "misconception_outlier_removal"}
        ],
        "correct_index": 1,
        "concepts_tested": ["central_limit_theorem", "sampling_distribution"],
        "misconceptions_detected": {"0": "clt_means_data_is_normal", "2": "mean_median_convergence", "3": "outlier_disappearance"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 2,
        "stem": "Correlation between two variables is 0.95. This means:",
        "options": [
            {"text": "One variable causes the other", "tag": "misconception_correlation_causation"},
            {"text": "There is a strong linear relationship between them", "tag": "correct"},
            {"text": "95% of the data points lie on a straight line", "tag": "misconception_percentage_on_line"},
            {"text": "Changing one variable will change the other by 95%", "tag": "misconception_percentage_change"}
        ],
        "correct_index": 1,
        "concepts_tested": ["correlation", "linear_relationship", "causation_vs_correlation"],
        "misconceptions_detected": {"0": "correlation_implies_causation", "2": "r_as_percentage_on_line", "3": "r_as_percentage_change"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "probability-statistics",
        "tier": 3,
        "stem": "You are comparing click-through rates of two website designs. Design A: 120/1000 clicks. Design B: 135/1000 clicks. How would you determine if B is genuinely better?",
        "options": [
            {"text": "B is better because 13.5% > 12.0%", "tag": "misconception_raw_comparison"},
            {"text": "Run a chi-squared test or a two-proportion z-test to check if the difference is statistically significant", "tag": "correct"},
            {"text": "Calculate the correlation between design type and clicks", "tag": "misconception_correlation_for_proportions"},
            {"text": "Use a paired t-test on the two groups", "tag": "misconception_paired_t_for_proportions"}
        ],
        "correct_index": 1,
        "concepts_tested": ["proportion_test", "ab_testing", "statistical_significance_application"],
        "misconceptions_detected": {"0": "raw_number_comparison", "2": "wrong_test_correlation", "3": "wrong_test_paired_t"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 3,
        "stem": "You trained a fraud detection model. Out of 10,000 transactions, 50 are actual fraud. Your model flags 80 as fraud, of which 40 are truly fraud. What is the precision of the model?",
        "options": [
            {"text": "40/50 = 80%", "tag": "misconception_recall_as_precision"},
            {"text": "40/80 = 50%", "tag": "correct"},
            {"text": "80/10000 = 0.8%", "tag": "misconception_false_positive_rate"},
            {"text": "40/10000 = 0.4%", "tag": "misconception_accuracy"}
        ],
        "correct_index": 1,
        "concepts_tested": ["precision", "recall", "confusion_matrix"],
        "misconceptions_detected": {"0": "recall_vs_precision", "2": "false_positive_rate_confusion", "3": "accuracy_confusion"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 3,
        "stem": "Your dataset has a feature where 95% of values are 0 and 5% are non-zero. The mean is 2.5 and the median is 0. Which summary statistic better represents the typical value?",
        "options": [
            {"text": "The mean, because it accounts for all values", "tag": "misconception_mean_always_best"},
            {"text": "The median, because it reflects what a typical observation looks like in this skewed distribution", "tag": "correct"},
            {"text": "Neither; you should use the mode", "tag": "misconception_mode_for_skewed"},
            {"text": "They are equally valid", "tag": "misconception_equivalence"}
        ],
        "correct_index": 1,
        "concepts_tested": ["skewed_distributions", "mean_vs_median", "robustness"],
        "misconceptions_detected": {"0": "mean_always_representative", "2": "mode_for_continuous", "3": "mean_median_equivalence"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 3,
        "stem": "You are monitoring a production ML model. The input feature distributions have shifted since training. Which metric would detect this kind of drift?",
        "options": [
            {"text": "Model accuracy on new data", "tag": "misconception_accuracy_detects_drift"},
            {"text": "Population Stability Index (PSI) or KL divergence on feature distributions", "tag": "correct"},
            {"text": "F1 score on the validation set", "tag": "misconception_validation_metric"},
            {"text": "Learning rate decay curve", "tag": "misconception_training_metric"}
        ],
        "correct_index": 1,
        "concepts_tested": ["data_drift", "distribution_shift", "monitoring_metrics"],
        "misconceptions_detected": {"0": "accuracy_detects_all_issues", "2": "validation_vs_production", "3": "training_vs_inference"}
    },
    {
        "domain_slug": "probability-statistics",
        "tier": 3,
        "stem": "You have two groups of users and want to test if their average session times differ. Group A has 15 users, Group B has 12 users. Session times are not normally distributed. Which test is most appropriate?",
        "options": [
            {"text": "Independent samples t-test", "tag": "misconception_t_test_always"},
            {"text": "Mann-Whitney U test (non-parametric alternative)", "tag": "correct"},
            {"text": "Chi-squared test", "tag": "misconception_chi_for_continuous"},
            {"text": "ANOVA", "tag": "misconception_anova_for_two_groups"}
        ],
        "correct_index": 1,
        "concepts_tested": ["non_parametric_tests", "test_selection", "normality_assumption"],
        "misconceptions_detected": {"0": "t_test_ignoring_assumptions", "2": "chi_squared_for_continuous", "3": "anova_for_two_groups"}
    },

    # =========================================================================
    # DOMAIN: python-programming (15 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "python-programming",
        "tier": 1,
        "stem": "What is the output of: print(type([1, 2, 3]))?",
        "options": [
            {"text": "<class 'tuple'>", "tag": "misconception_tuple_list"},
            {"text": "<class 'list'>", "tag": "correct"},
            {"text": "<class 'array'>", "tag": "misconception_array"},
            {"text": "<class 'set'>", "tag": "misconception_set"}
        ],
        "correct_index": 1,
        "concepts_tested": ["data_types", "list_basics"],
        "misconceptions_detected": {"0": "tuple_vs_list_syntax", "2": "no_builtin_array", "3": "set_vs_list"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 1,
        "stem": "What does `len({'a': 1, 'b': 2, 'c': 3})` return?",
        "options": [
            {"text": "6", "tag": "misconception_counting_keys_and_values"},
            {"text": "3", "tag": "correct"},
            {"text": "Error: len() does not work on dicts", "tag": "misconception_len_only_lists"},
            {"text": "{'a', 'b', 'c'}", "tag": "misconception_returns_keys"}
        ],
        "correct_index": 1,
        "concepts_tested": ["dict_basics", "len_function"],
        "misconceptions_detected": {"0": "counts_keys_and_values", "2": "len_only_for_lists", "3": "len_returns_keys"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 1,
        "stem": "What is the value of x after: x = [1, 2, 3]; y = x; y.append(4)?",
        "options": [
            {"text": "[1, 2, 3]", "tag": "misconception_copy_on_assign"},
            {"text": "[1, 2, 3, 4]", "tag": "correct"},
            {"text": "Error: cannot modify through y", "tag": "misconception_immutable_reference"},
            {"text": "[4]", "tag": "misconception_overwrite"}
        ],
        "correct_index": 1,
        "concepts_tested": ["references", "mutability", "list_aliasing"],
        "misconceptions_detected": {"0": "copy_on_assignment", "2": "reference_immutability", "3": "overwrite_confusion"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 1,
        "stem": "Which keyword is used to define a function in Python?",
        "options": [
            {"text": "function", "tag": "misconception_javascript_syntax"},
            {"text": "func", "tag": "misconception_go_syntax"},
            {"text": "def", "tag": "correct"},
            {"text": "fn", "tag": "misconception_rust_syntax"}
        ],
        "correct_index": 2,
        "concepts_tested": ["function_definition", "python_syntax"],
        "misconceptions_detected": {"0": "javascript_syntax", "1": "go_syntax", "3": "rust_syntax"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 1,
        "stem": "What does `'hello world'.split()` return?",
        "options": [
            {"text": "['h', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd']", "tag": "misconception_split_chars"},
            {"text": "['hello world']", "tag": "misconception_no_split"},
            {"text": "['hello', 'world']", "tag": "correct"},
            {"text": "('hello', 'world')", "tag": "misconception_returns_tuple"}
        ],
        "correct_index": 2,
        "concepts_tested": ["string_methods", "split"],
        "misconceptions_detected": {"0": "split_into_characters", "1": "split_does_nothing", "3": "split_returns_tuple"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "python-programming",
        "tier": 2,
        "stem": "What is the output of: print([i**2 for i in range(5) if i % 2 == 0])?",
        "options": [
            {"text": "[0, 4, 16]", "tag": "correct"},
            {"text": "[1, 9, 25]", "tag": "misconception_odd_filter"},
            {"text": "[0, 1, 4, 9, 16]", "tag": "misconception_no_filter"},
            {"text": "Error: invalid syntax", "tag": "misconception_comprehension_syntax"}
        ],
        "correct_index": 0,
        "concepts_tested": ["list_comprehension", "filtering", "range"],
        "misconceptions_detected": {"1": "odd_vs_even_filter", "2": "ignoring_filter", "3": "comprehension_unfamiliarity"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 2,
        "stem": "What is the difference between a list and a tuple in Python?",
        "options": [
            {"text": "Lists are faster than tuples", "tag": "misconception_list_faster"},
            {"text": "Tuples can hold different types but lists cannot", "tag": "misconception_type_restriction"},
            {"text": "Lists are mutable; tuples are immutable", "tag": "correct"},
            {"text": "There is no difference; they are interchangeable", "tag": "misconception_no_difference"}
        ],
        "correct_index": 2,
        "concepts_tested": ["mutability", "tuple_vs_list", "data_structures"],
        "misconceptions_detected": {"0": "list_faster_than_tuple", "1": "type_restriction", "3": "no_difference"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 2,
        "stem": "What happens when you use a mutable default argument in a function?\n\ndef add_item(item, lst=[]):\n    lst.append(item)\n    return lst",
        "options": [
            {"text": "Each call gets a fresh empty list", "tag": "misconception_fresh_default"},
            {"text": "The default list is shared across calls, accumulating items", "tag": "correct"},
            {"text": "Python raises a SyntaxError", "tag": "misconception_syntax_error"},
            {"text": "The function returns None", "tag": "misconception_returns_none"}
        ],
        "correct_index": 1,
        "concepts_tested": ["mutable_default_args", "function_defaults", "python_gotchas"],
        "misconceptions_detected": {"0": "fresh_default_each_call", "2": "mutable_default_invalid", "3": "append_returns_none"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 2,
        "stem": "What does the `yield` keyword do in a Python function?",
        "options": [
            {"text": "Returns a value and terminates the function permanently", "tag": "misconception_yield_is_return"},
            {"text": "Pauses the function and produces a value; the function can be resumed later", "tag": "correct"},
            {"text": "Runs the function in a separate thread", "tag": "misconception_yield_threading"},
            {"text": "Raises a StopIteration exception", "tag": "misconception_yield_raises"}
        ],
        "correct_index": 1,
        "concepts_tested": ["generators", "yield", "lazy_evaluation"],
        "misconceptions_detected": {"0": "yield_same_as_return", "2": "yield_creates_thread", "3": "yield_raises_exception"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 2,
        "stem": "What is the time complexity of checking if an element exists in a Python set?",
        "options": [
            {"text": "O(n)", "tag": "misconception_linear_lookup"},
            {"text": "O(1) average case", "tag": "correct"},
            {"text": "O(log n)", "tag": "misconception_binary_search"},
            {"text": "O(n log n)", "tag": "misconception_sorting"}
        ],
        "correct_index": 1,
        "concepts_tested": ["set_operations", "time_complexity", "hash_tables"],
        "misconceptions_detected": {"0": "set_uses_linear_search", "2": "set_uses_binary_search", "3": "set_sorts_first"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "python-programming",
        "tier": 3,
        "stem": "You need to process a 10GB CSV file line by line without loading it all into memory. Which approach is best?",
        "options": [
            {"text": "df = pandas.read_csv('file.csv') and iterate df.iterrows()", "tag": "misconception_pandas_always"},
            {"text": "Use open() and iterate line by line, or use pandas with chunksize parameter", "tag": "correct"},
            {"text": "Read the entire file with file.read() and split by newlines", "tag": "misconception_read_all"},
            {"text": "Use multiprocessing to split the file into parts first", "tag": "misconception_multiprocessing_first"}
        ],
        "correct_index": 1,
        "concepts_tested": ["memory_management", "file_io", "streaming_data"],
        "misconceptions_detected": {"0": "pandas_loads_all_memory", "2": "read_all_into_memory", "3": "premature_parallelization"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 3,
        "stem": "You want to make 100 HTTP requests concurrently in Python. What is the most efficient approach?",
        "options": [
            {"text": "A for loop making requests one at a time with the requests library", "tag": "misconception_sequential"},
            {"text": "Use asyncio with aiohttp to make non-blocking concurrent requests", "tag": "correct"},
            {"text": "Create 100 threads with threading.Thread for each request", "tag": "misconception_thread_per_request"},
            {"text": "Use multiprocessing.Pool with 100 workers", "tag": "misconception_multiprocessing_for_io"}
        ],
        "correct_index": 1,
        "concepts_tested": ["async_programming", "concurrency", "io_bound_tasks"],
        "misconceptions_detected": {"0": "sequential_thinking", "2": "thread_per_request", "3": "multiprocessing_for_io"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 3,
        "stem": "What does the @property decorator do in Python?",
        "options": [
            {"text": "Makes a class attribute private and inaccessible", "tag": "misconception_private"},
            {"text": "Allows a method to be accessed like an attribute, enabling computed properties with getter/setter logic", "tag": "correct"},
            {"text": "Converts a method into a static method", "tag": "misconception_static"},
            {"text": "Freezes the attribute so it cannot be modified", "tag": "misconception_frozen"}
        ],
        "correct_index": 1,
        "concepts_tested": ["property_decorator", "oop", "descriptors"],
        "misconceptions_detected": {"0": "property_makes_private", "2": "property_is_static", "3": "property_is_frozen"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 3,
        "stem": "You have a dictionary with 10 million keys. You need to check if a key exists and retrieve its value. What is the performance characteristic?",
        "options": [
            {"text": "Slow — Python dicts do linear scan, so O(n)", "tag": "misconception_dict_linear"},
            {"text": "Fast — Python dicts use hash tables, so O(1) average for lookup", "tag": "correct"},
            {"text": "Moderate — Python dicts use balanced trees, so O(log n)", "tag": "misconception_dict_tree"},
            {"text": "It depends on the type of keys used", "tag": "misconception_key_type_affects_complexity"}
        ],
        "correct_index": 1,
        "concepts_tested": ["dict_internals", "hash_tables", "time_complexity"],
        "misconceptions_detected": {"0": "dict_linear_scan", "2": "dict_uses_trees", "3": "key_type_changes_complexity"}
    },
    {
        "domain_slug": "python-programming",
        "tier": 3,
        "stem": "You see this error: 'TypeError: unhashable type: list'. What caused it?",
        "options": [
            {"text": "You tried to sort a list of mixed types", "tag": "misconception_sorting_error"},
            {"text": "You tried to use a list as a dictionary key or set element", "tag": "correct"},
            {"text": "You tried to concatenate a list and a string", "tag": "misconception_concat_error"},
            {"text": "You tried to pass a list to a function that expects a tuple", "tag": "misconception_type_mismatch"}
        ],
        "correct_index": 1,
        "concepts_tested": ["hashability", "dict_keys", "set_elements", "mutability"],
        "misconceptions_detected": {"0": "unhashable_is_sort_error", "2": "unhashable_is_concat_error", "3": "unhashable_is_type_mismatch"}
    },

    # =========================================================================
    # DOMAIN: ml-fundamentals (15 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "ml-fundamentals",
        "tier": 1,
        "stem": "What is the difference between supervised and unsupervised learning?",
        "options": [
            {"text": "Supervised learning uses more data", "tag": "misconception_data_quantity"},
            {"text": "Supervised learning uses labeled data; unsupervised learning finds patterns without labels", "tag": "correct"},
            {"text": "Unsupervised learning is more accurate", "tag": "misconception_accuracy"},
            {"text": "Supervised learning does not need a training phase", "tag": "misconception_no_training"}
        ],
        "correct_index": 1,
        "concepts_tested": ["supervised_learning", "unsupervised_learning", "labeled_data"],
        "misconceptions_detected": {"0": "data_quantity_distinction", "2": "unsupervised_more_accurate", "3": "no_training_supervised"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 1,
        "stem": "Overfitting occurs when a model:",
        "options": [
            {"text": "Performs well on training data but poorly on unseen data", "tag": "correct"},
            {"text": "Is too simple to capture patterns in the data", "tag": "misconception_underfitting"},
            {"text": "Takes too long to train", "tag": "misconception_training_time"},
            {"text": "Uses too little training data", "tag": "misconception_data_size_only"}
        ],
        "correct_index": 0,
        "concepts_tested": ["overfitting", "generalization", "train_test_gap"],
        "misconceptions_detected": {"1": "confusing_over_under_fitting", "2": "overfitting_is_slow_training", "3": "overfitting_only_about_data_size"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 1,
        "stem": "What is a feature in machine learning?",
        "options": [
            {"text": "The output/prediction of a model", "tag": "misconception_feature_is_output"},
            {"text": "An input variable used to make predictions", "tag": "correct"},
            {"text": "The accuracy score of a model", "tag": "misconception_feature_is_metric"},
            {"text": "A type of neural network layer", "tag": "misconception_feature_is_layer"}
        ],
        "correct_index": 1,
        "concepts_tested": ["features", "input_variables", "ml_terminology"],
        "misconceptions_detected": {"0": "feature_vs_label", "2": "feature_vs_metric", "3": "feature_vs_layer"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 1,
        "stem": "Why do we split data into training and test sets?",
        "options": [
            {"text": "To make training faster", "tag": "misconception_speed"},
            {"text": "To evaluate how well the model generalizes to unseen data", "tag": "correct"},
            {"text": "Because models can only learn from half the data at a time", "tag": "misconception_capacity"},
            {"text": "It is optional and not always necessary", "tag": "misconception_optional"}
        ],
        "correct_index": 1,
        "concepts_tested": ["train_test_split", "generalization", "evaluation"],
        "misconceptions_detected": {"0": "split_for_speed", "2": "model_capacity_limit", "3": "split_is_optional"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 1,
        "stem": "Linear regression predicts:",
        "options": [
            {"text": "Categories (e.g., cat vs dog)", "tag": "misconception_classification"},
            {"text": "A continuous numeric value", "tag": "correct"},
            {"text": "Clusters in the data", "tag": "misconception_clustering"},
            {"text": "The probability of an event", "tag": "misconception_logistic"}
        ],
        "correct_index": 1,
        "concepts_tested": ["linear_regression", "regression_vs_classification"],
        "misconceptions_detected": {"0": "regression_vs_classification", "2": "regression_vs_clustering", "3": "regression_vs_logistic"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "ml-fundamentals",
        "tier": 2,
        "stem": "What is the bias-variance tradeoff?",
        "options": [
            {"text": "Biased models are always worse than unbiased models", "tag": "misconception_bias_always_bad"},
            {"text": "Reducing bias increases variance and vice versa; the goal is to minimize total error", "tag": "correct"},
            {"text": "Bias refers to the size of the dataset and variance refers to the number of features", "tag": "misconception_data_features"},
            {"text": "Variance only matters in unsupervised learning", "tag": "misconception_supervised_only"}
        ],
        "correct_index": 1,
        "concepts_tested": ["bias_variance_tradeoff", "model_complexity", "total_error"],
        "misconceptions_detected": {"0": "bias_always_bad", "2": "bias_is_data_size", "3": "variance_unsupervised_only"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 2,
        "stem": "Regularization (L1/L2) helps prevent overfitting by:",
        "options": [
            {"text": "Adding more training data", "tag": "misconception_more_data"},
            {"text": "Penalizing large model weights, discouraging complexity", "tag": "correct"},
            {"text": "Removing features with low variance", "tag": "misconception_feature_selection"},
            {"text": "Increasing the learning rate", "tag": "misconception_learning_rate"}
        ],
        "correct_index": 1,
        "concepts_tested": ["regularization", "l1_l2", "overfitting_prevention"],
        "misconceptions_detected": {"0": "regularization_is_more_data", "2": "regularization_is_feature_removal", "3": "regularization_is_lr_increase"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 2,
        "stem": "Cross-validation is used to:",
        "options": [
            {"text": "Clean the data before training", "tag": "misconception_data_cleaning"},
            {"text": "Get a more reliable estimate of model performance by testing on multiple data folds", "tag": "correct"},
            {"text": "Speed up model training by using parallel folds", "tag": "misconception_speed"},
            {"text": "Automatically tune hyperparameters", "tag": "misconception_auto_tuning"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cross_validation", "model_evaluation", "k_fold"],
        "misconceptions_detected": {"0": "cv_is_cleaning", "2": "cv_for_speed", "3": "cv_auto_tunes"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 2,
        "stem": "When should you use F1 score instead of accuracy?",
        "options": [
            {"text": "Always; F1 is a better metric than accuracy in every situation", "tag": "misconception_f1_always_better"},
            {"text": "When classes are imbalanced and you care about both false positives and false negatives", "tag": "correct"},
            {"text": "When training a regression model", "tag": "misconception_f1_for_regression"},
            {"text": "When you have more than two classes", "tag": "misconception_multiclass_only"}
        ],
        "correct_index": 1,
        "concepts_tested": ["f1_score", "class_imbalance", "evaluation_metrics"],
        "misconceptions_detected": {"0": "f1_always_superior", "2": "f1_for_regression", "3": "f1_multiclass_only"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 2,
        "stem": "What is the purpose of a validation set (distinct from test set)?",
        "options": [
            {"text": "To train the model on additional data", "tag": "misconception_more_training"},
            {"text": "To tune hyperparameters and make model selection decisions without touching the test set", "tag": "correct"},
            {"text": "To check for data quality issues", "tag": "misconception_data_quality"},
            {"text": "It is just another name for the test set", "tag": "misconception_same_as_test"}
        ],
        "correct_index": 1,
        "concepts_tested": ["validation_set", "hyperparameter_tuning", "model_selection"],
        "misconceptions_detected": {"0": "validation_for_training", "2": "validation_for_quality", "3": "validation_is_test"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "ml-fundamentals",
        "tier": 3,
        "stem": "You have a dataset with 10,000 samples and 500 features. Your model has near-perfect training accuracy but poor test accuracy. What should you try first?",
        "options": [
            {"text": "Add more features to improve the model", "tag": "misconception_more_features"},
            {"text": "Apply regularization or reduce the number of features (dimensionality reduction)", "tag": "correct"},
            {"text": "Train for more epochs", "tag": "misconception_more_epochs"},
            {"text": "Switch to a more complex model", "tag": "misconception_more_complexity"}
        ],
        "correct_index": 1,
        "concepts_tested": ["overfitting_diagnosis", "regularization", "dimensionality_reduction"],
        "misconceptions_detected": {"0": "more_features_helps_overfit", "2": "more_epochs_fixes_overfit", "3": "more_complexity_fixes_overfit"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 3,
        "stem": "Your classification model achieves 98% accuracy on a dataset where 97% of samples belong to class A. Is this model good?",
        "options": [
            {"text": "Yes, 98% accuracy is excellent", "tag": "misconception_accuracy_misleading"},
            {"text": "No, a naive classifier predicting all-A would get 97%; the model barely beats random", "tag": "correct"},
            {"text": "Yes, but only if the AUC is also above 0.9", "tag": "misconception_auc_threshold"},
            {"text": "Cannot determine without the confusion matrix, but 98% is promising", "tag": "misconception_promising"}
        ],
        "correct_index": 1,
        "concepts_tested": ["class_imbalance", "accuracy_paradox", "baseline_comparison"],
        "misconceptions_detected": {"0": "accuracy_always_meaningful", "2": "arbitrary_auc_threshold", "3": "accuracy_is_promising"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 3,
        "stem": "You want to predict house prices using features like area, bedrooms, and location. Some features have very different scales (area in sq ft: 500-5000, bedrooms: 1-6). What should you do before training a gradient-based model?",
        "options": [
            {"text": "Nothing; the model will learn the correct weights regardless of scale", "tag": "misconception_scale_irrelevant"},
            {"text": "Normalize or standardize the features to a common scale", "tag": "correct"},
            {"text": "Remove the features with smaller ranges", "tag": "misconception_remove_small_range"},
            {"text": "Convert all features to integers", "tag": "misconception_integer_conversion"}
        ],
        "correct_index": 1,
        "concepts_tested": ["feature_scaling", "normalization", "gradient_descent"],
        "misconceptions_detected": {"0": "scale_irrelevant_for_gradients", "2": "remove_small_range", "3": "convert_to_integer"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 3,
        "stem": "You are building a spam classifier. Which type of error is worse: classifying a legitimate email as spam (false positive), or letting a spam email through (false negative)?",
        "options": [
            {"text": "Both are equally bad", "tag": "misconception_equal_cost"},
            {"text": "False positive (legitimate email marked as spam) is typically worse, because the user might miss important messages", "tag": "correct"},
            {"text": "False negative (spam getting through) is always worse", "tag": "misconception_fn_always_worse"},
            {"text": "This depends on the model architecture, not the problem", "tag": "misconception_architecture_dependent"}
        ],
        "correct_index": 1,
        "concepts_tested": ["error_types", "cost_sensitive_learning", "precision_recall_tradeoff"],
        "misconceptions_detected": {"0": "equal_error_costs", "2": "fn_always_worse", "3": "error_cost_is_architecture"}
    },
    {
        "domain_slug": "ml-fundamentals",
        "tier": 3,
        "stem": "Your model performs well on cross-validation but poorly when deployed. What is the most likely cause?",
        "options": [
            {"text": "The cross-validation had too many folds", "tag": "misconception_fold_count"},
            {"text": "Data drift: the production data distribution differs from training data", "tag": "correct"},
            {"text": "The model needs more regularization", "tag": "misconception_more_regularization"},
            {"text": "Cross-validation is unreliable and should not be trusted", "tag": "misconception_cv_unreliable"}
        ],
        "correct_index": 1,
        "concepts_tested": ["data_drift", "train_production_gap", "deployment"],
        "misconceptions_detected": {"0": "fold_count_issue", "2": "always_more_regularization", "3": "cv_is_unreliable"}
    },

    # =========================================================================
    # DOMAIN: systems-design (15 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "systems-design",
        "tier": 1,
        "stem": "What does 'latency' mean in a distributed system?",
        "options": [
            {"text": "The total amount of data transferred", "tag": "misconception_bandwidth"},
            {"text": "The time it takes for a request to travel from client to server and back", "tag": "correct"},
            {"text": "The number of requests per second the system can handle", "tag": "misconception_throughput"},
            {"text": "How much memory the system uses", "tag": "misconception_memory"}
        ],
        "correct_index": 1,
        "concepts_tested": ["latency", "performance_basics"],
        "misconceptions_detected": {"0": "latency_vs_bandwidth", "2": "latency_vs_throughput", "3": "latency_vs_memory"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 1,
        "stem": "What is the purpose of a load balancer?",
        "options": [
            {"text": "To store data across multiple databases", "tag": "misconception_storage"},
            {"text": "To distribute incoming requests across multiple servers", "tag": "correct"},
            {"text": "To compress data before sending it to the client", "tag": "misconception_compression"},
            {"text": "To encrypt network traffic", "tag": "misconception_encryption"}
        ],
        "correct_index": 1,
        "concepts_tested": ["load_balancing", "horizontal_scaling"],
        "misconceptions_detected": {"0": "lb_is_storage", "2": "lb_is_compression", "3": "lb_is_encryption"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 1,
        "stem": "What is a REST API?",
        "options": [
            {"text": "A database query language", "tag": "misconception_query_language"},
            {"text": "An architectural style for building web services using HTTP methods (GET, POST, PUT, DELETE)", "tag": "correct"},
            {"text": "A type of programming language", "tag": "misconception_language"},
            {"text": "A specific cloud computing service", "tag": "misconception_cloud_service"}
        ],
        "correct_index": 1,
        "concepts_tested": ["rest_api", "http_methods", "web_services"],
        "misconceptions_detected": {"0": "rest_is_query_language", "2": "rest_is_language", "3": "rest_is_cloud_service"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 1,
        "stem": "What does 'horizontal scaling' mean?",
        "options": [
            {"text": "Adding more CPU/RAM to a single server", "tag": "misconception_vertical"},
            {"text": "Adding more servers to handle increased load", "tag": "correct"},
            {"text": "Making the codebase wider by adding more modules", "tag": "misconception_code_modules"},
            {"text": "Increasing the network bandwidth", "tag": "misconception_bandwidth"}
        ],
        "correct_index": 1,
        "concepts_tested": ["horizontal_scaling", "vertical_scaling", "scalability"],
        "misconceptions_detected": {"0": "horizontal_vs_vertical", "2": "scaling_is_code_modules", "3": "scaling_is_bandwidth"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 1,
        "stem": "What does a cache do in a system?",
        "options": [
            {"text": "Permanently stores data so it never needs to be recalculated", "tag": "misconception_permanent_storage"},
            {"text": "Stores frequently accessed data in fast storage to reduce latency and database load", "tag": "correct"},
            {"text": "Backs up data in case of server failure", "tag": "misconception_backup"},
            {"text": "Encrypts data at rest", "tag": "misconception_encryption"}
        ],
        "correct_index": 1,
        "concepts_tested": ["caching", "performance_optimization"],
        "misconceptions_detected": {"0": "cache_is_permanent", "2": "cache_is_backup", "3": "cache_is_encryption"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "systems-design",
        "tier": 2,
        "stem": "The CAP theorem states that a distributed system can guarantee at most two of three properties. Which three?",
        "options": [
            {"text": "Cost, Availability, Performance", "tag": "misconception_cap_wrong"},
            {"text": "Consistency, Availability, Partition tolerance", "tag": "correct"},
            {"text": "Compression, Authentication, Parallelism", "tag": "misconception_cap_wrong_2"},
            {"text": "Concurrency, Atomicity, Persistence", "tag": "misconception_acid"}
        ],
        "correct_index": 1,
        "concepts_tested": ["cap_theorem", "distributed_systems_theory"],
        "misconceptions_detected": {"0": "cap_wrong_acronym", "2": "cap_wrong_acronym_2", "3": "cap_vs_acid"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 2,
        "stem": "When would you use a message queue (like Kafka or RabbitMQ) instead of direct API calls?",
        "options": [
            {"text": "When you need faster response times", "tag": "misconception_faster"},
            {"text": "When you need to decouple producers and consumers, handle traffic spikes, or ensure delivery even if consumers are temporarily down", "tag": "correct"},
            {"text": "Only when building real-time chat applications", "tag": "misconception_chat_only"},
            {"text": "When you want to reduce the number of servers needed", "tag": "misconception_fewer_servers"}
        ],
        "correct_index": 1,
        "concepts_tested": ["message_queues", "decoupling", "async_processing"],
        "misconceptions_detected": {"0": "queues_are_faster", "2": "queues_only_for_chat", "3": "queues_reduce_servers"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 2,
        "stem": "What is the difference between SQL and NoSQL databases?",
        "options": [
            {"text": "SQL databases are older and always slower", "tag": "misconception_sql_slow"},
            {"text": "SQL databases enforce structured schemas with relations; NoSQL databases offer flexible schemas optimized for specific access patterns", "tag": "correct"},
            {"text": "NoSQL databases do not support queries", "tag": "misconception_no_queries"},
            {"text": "SQL databases can only handle small datasets", "tag": "misconception_sql_small"}
        ],
        "correct_index": 1,
        "concepts_tested": ["sql_vs_nosql", "database_selection", "schema_design"],
        "misconceptions_detected": {"0": "sql_is_always_slow", "2": "nosql_has_no_queries", "3": "sql_only_small_data"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 2,
        "stem": "What problem does database sharding solve?",
        "options": [
            {"text": "Slow query execution due to missing indexes", "tag": "misconception_indexing"},
            {"text": "A single database server cannot handle the data volume or query load, so data is partitioned across multiple servers", "tag": "correct"},
            {"text": "Data duplication across tables", "tag": "misconception_deduplication"},
            {"text": "Network latency between client and server", "tag": "misconception_latency"}
        ],
        "correct_index": 1,
        "concepts_tested": ["sharding", "horizontal_partitioning", "database_scaling"],
        "misconceptions_detected": {"0": "sharding_vs_indexing", "2": "sharding_vs_dedup", "3": "sharding_vs_latency"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 2,
        "stem": "What is eventual consistency?",
        "options": [
            {"text": "The system will never be consistent", "tag": "misconception_never_consistent"},
            {"text": "All replicas will converge to the same state given enough time without new updates", "tag": "correct"},
            {"text": "The system is always consistent after every write", "tag": "misconception_strong_consistency"},
            {"text": "Data is only consistent during business hours", "tag": "misconception_time_based"}
        ],
        "correct_index": 1,
        "concepts_tested": ["eventual_consistency", "distributed_consensus"],
        "misconceptions_detected": {"0": "never_consistent", "2": "eventual_is_strong", "3": "time_based_consistency"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "systems-design",
        "tier": 3,
        "stem": "You are designing a URL shortener (like bit.ly). Which data store would you choose for mapping short URLs to long URLs?",
        "options": [
            {"text": "A relational database with complex joins across multiple tables", "tag": "misconception_complex_relational"},
            {"text": "A key-value store (like Redis or DynamoDB) for fast O(1) lookups by short URL key", "tag": "correct"},
            {"text": "A graph database to model URL relationships", "tag": "misconception_graph_db"},
            {"text": "A file system with one file per URL", "tag": "misconception_file_system"}
        ],
        "correct_index": 1,
        "concepts_tested": ["database_selection", "key_value_stores", "access_patterns"],
        "misconceptions_detected": {"0": "over_engineered_relational", "2": "graph_for_simple_mapping", "3": "file_per_record"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 3,
        "stem": "Your web application needs to send a confirmation email after a user signs up. Should this happen synchronously in the signup API request?",
        "options": [
            {"text": "Yes, the user needs to wait for the email to be sent before getting a response", "tag": "misconception_synchronous_email"},
            {"text": "No, push the email task to a background queue and respond to the user immediately", "tag": "correct"},
            {"text": "Yes, but only if the email service is fast enough", "tag": "misconception_speed_dependent"},
            {"text": "No, emails should be sent in a daily batch job instead", "tag": "misconception_batch"}
        ],
        "correct_index": 1,
        "concepts_tested": ["async_processing", "message_queues", "user_experience"],
        "misconceptions_detected": {"0": "sync_side_effects", "2": "speed_determines_sync", "3": "batch_for_realtime"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 3,
        "stem": "You need to design a system that processes 1 million events per second from IoT sensors. Which architecture pattern is most appropriate?",
        "options": [
            {"text": "A single REST API server with a PostgreSQL database", "tag": "misconception_monolith"},
            {"text": "A streaming pipeline using Kafka for ingestion with a stream processor like Flink or Spark Streaming", "tag": "correct"},
            {"text": "A batch processing job that runs every hour using Hadoop MapReduce", "tag": "misconception_batch_processing"},
            {"text": "A serverless function triggered for each event", "tag": "misconception_serverless_at_scale"}
        ],
        "correct_index": 1,
        "concepts_tested": ["stream_processing", "event_driven_architecture", "scalability"],
        "misconceptions_detected": {"0": "monolith_for_streaming", "2": "batch_for_realtime", "3": "serverless_for_million_rps"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 3,
        "stem": "Your API is receiving 10x more traffic than expected during a product launch. What is the fastest way to handle this?",
        "options": [
            {"text": "Rewrite the entire backend in a faster language", "tag": "misconception_rewrite"},
            {"text": "Add more server instances behind the load balancer (horizontal scaling) and enable caching for repeated queries", "tag": "correct"},
            {"text": "Increase the database connection pool size only", "tag": "misconception_db_pool_only"},
            {"text": "Ask users to try again later", "tag": "misconception_manual_throttle"}
        ],
        "correct_index": 1,
        "concepts_tested": ["scaling_strategies", "caching", "load_balancing"],
        "misconceptions_detected": {"0": "rewrite_for_scale", "2": "db_pool_is_enough", "3": "manual_throttle"}
    },
    {
        "domain_slug": "systems-design",
        "tier": 3,
        "stem": "You are building a real-time collaborative document editor (like Google Docs). What is the main technical challenge?",
        "options": [
            {"text": "Storing large documents in the database", "tag": "misconception_storage"},
            {"text": "Handling concurrent edits from multiple users and resolving conflicts in real-time (using CRDTs or OT)", "tag": "correct"},
            {"text": "Rendering the document in the browser", "tag": "misconception_rendering"},
            {"text": "User authentication and access control", "tag": "misconception_auth"}
        ],
        "correct_index": 1,
        "concepts_tested": ["conflict_resolution", "crdts", "operational_transformation", "real_time_systems"],
        "misconceptions_detected": {"0": "storage_is_challenge", "2": "rendering_is_challenge", "3": "auth_is_challenge"}
    },

    # =========================================================================
    # DOMAIN: data-structures-algorithms (15 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 1,
        "stem": "What is the time complexity of searching for an element in an unsorted array of n elements?",
        "options": [
            {"text": "O(1)", "tag": "misconception_constant"},
            {"text": "O(log n)", "tag": "misconception_binary_search"},
            {"text": "O(n)", "tag": "correct"},
            {"text": "O(n²)", "tag": "misconception_quadratic"}
        ],
        "correct_index": 2,
        "concepts_tested": ["linear_search", "time_complexity", "big_o"],
        "misconceptions_detected": {"0": "constant_time_search", "1": "binary_search_unsorted", "3": "quadratic_search"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 1,
        "stem": "What data structure uses FIFO (First In, First Out) ordering?",
        "options": [
            {"text": "Stack", "tag": "misconception_stack"},
            {"text": "Queue", "tag": "correct"},
            {"text": "Binary tree", "tag": "misconception_tree"},
            {"text": "Hash table", "tag": "misconception_hash"}
        ],
        "correct_index": 1,
        "concepts_tested": ["queue", "fifo", "data_structure_basics"],
        "misconceptions_detected": {"0": "stack_is_fifo", "2": "tree_is_fifo", "3": "hash_is_fifo"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 1,
        "stem": "What is the time complexity of accessing an element by index in an array?",
        "options": [
            {"text": "O(n)", "tag": "misconception_linear"},
            {"text": "O(1)", "tag": "correct"},
            {"text": "O(log n)", "tag": "misconception_logarithmic"},
            {"text": "O(n log n)", "tag": "misconception_nlogn"}
        ],
        "correct_index": 1,
        "concepts_tested": ["array_access", "random_access", "time_complexity"],
        "misconceptions_detected": {"0": "linear_array_access", "2": "logarithmic_array_access", "3": "nlogn_array_access"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 1,
        "stem": "What is a hash table used for?",
        "options": [
            {"text": "Sorting data in order", "tag": "misconception_sorting"},
            {"text": "Fast key-value lookups using a hash function", "tag": "correct"},
            {"text": "Encrypting data", "tag": "misconception_encryption"},
            {"text": "Traversing graphs", "tag": "misconception_graphs"}
        ],
        "correct_index": 1,
        "concepts_tested": ["hash_table", "key_value", "hash_function"],
        "misconceptions_detected": {"0": "hash_for_sorting", "2": "hash_for_encryption", "3": "hash_for_graphs"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 1,
        "stem": "What is recursion?",
        "options": [
            {"text": "A loop that runs forever", "tag": "misconception_infinite_loop"},
            {"text": "A function that calls itself with a smaller subproblem until reaching a base case", "tag": "correct"},
            {"text": "A way to sort data", "tag": "misconception_sorting"},
            {"text": "A method to allocate memory", "tag": "misconception_memory"}
        ],
        "correct_index": 1,
        "concepts_tested": ["recursion", "base_case", "subproblems"],
        "misconceptions_detected": {"0": "recursion_is_infinite", "2": "recursion_is_sorting", "3": "recursion_is_memory"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 2,
        "stem": "Why is binary search O(log n) instead of O(n)?",
        "options": [
            {"text": "Because it uses less memory", "tag": "misconception_memory"},
            {"text": "Because it halves the search space with each comparison, so it only needs log₂(n) steps", "tag": "correct"},
            {"text": "Because it uses a hash function", "tag": "misconception_hashing"},
            {"text": "Because it sorts the array first", "tag": "misconception_sorting_step"}
        ],
        "correct_index": 1,
        "concepts_tested": ["binary_search", "logarithmic_complexity", "divide_and_conquer"],
        "misconceptions_detected": {"0": "complexity_is_about_memory", "2": "binary_search_uses_hash", "3": "binary_search_sorts"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 2,
        "stem": "When would you use a linked list instead of an array?",
        "options": [
            {"text": "When you need fast random access by index", "tag": "misconception_random_access"},
            {"text": "When you need frequent insertions/deletions at arbitrary positions and don't need random access", "tag": "correct"},
            {"text": "Always; linked lists are better than arrays in every way", "tag": "misconception_always_better"},
            {"text": "When you need to sort the data", "tag": "misconception_sorting"}
        ],
        "correct_index": 1,
        "concepts_tested": ["linked_list_vs_array", "insertion_deletion", "tradeoffs"],
        "misconceptions_detected": {"0": "ll_has_random_access", "2": "ll_always_better", "3": "ll_for_sorting"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 2,
        "stem": "What is the worst-case time complexity of quicksort?",
        "options": [
            {"text": "O(n log n)", "tag": "misconception_always_nlogn"},
            {"text": "O(n²)", "tag": "correct"},
            {"text": "O(n)", "tag": "misconception_linear"},
            {"text": "O(log n)", "tag": "misconception_logarithmic"}
        ],
        "correct_index": 1,
        "concepts_tested": ["quicksort", "worst_case_analysis", "pivot_selection"],
        "misconceptions_detected": {"0": "quicksort_always_nlogn", "2": "quicksort_linear", "3": "quicksort_logarithmic"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 2,
        "stem": "What is the key idea behind dynamic programming?",
        "options": [
            {"text": "Using multiple threads to solve the problem faster", "tag": "misconception_parallelism"},
            {"text": "Breaking a problem into overlapping subproblems and storing their solutions to avoid redundant computation", "tag": "correct"},
            {"text": "Dynamically allocating memory at runtime", "tag": "misconception_memory_allocation"},
            {"text": "Using random algorithms to find approximate solutions", "tag": "misconception_randomized"}
        ],
        "correct_index": 1,
        "concepts_tested": ["dynamic_programming", "memoization", "overlapping_subproblems"],
        "misconceptions_detected": {"0": "dp_is_parallelism", "2": "dp_is_memory_allocation", "3": "dp_is_randomized"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 2,
        "stem": "What is the difference between BFS and DFS in graph traversal?",
        "options": [
            {"text": "BFS is faster than DFS", "tag": "misconception_speed"},
            {"text": "BFS explores level by level (using a queue); DFS explores as deep as possible first (using a stack)", "tag": "correct"},
            {"text": "DFS only works on trees, not graphs", "tag": "misconception_trees_only"},
            {"text": "BFS finds the shortest path in weighted graphs", "tag": "misconception_weighted_shortest"}
        ],
        "correct_index": 1,
        "concepts_tested": ["bfs", "dfs", "graph_traversal"],
        "misconceptions_detected": {"0": "bfs_always_faster", "2": "dfs_trees_only", "3": "bfs_weighted_shortest"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 3,
        "stem": "You need to find the top 10 most frequent words in a 1TB text file that doesn't fit in memory. Which approach is most practical?",
        "options": [
            {"text": "Load the entire file into memory and use a hash map", "tag": "misconception_load_all"},
            {"text": "Use external sorting or a map-reduce approach: split the file, count locally, merge results, then use a min-heap of size 10", "tag": "correct"},
            {"text": "Sort the entire file alphabetically first, then count consecutive duplicates", "tag": "misconception_full_sort"},
            {"text": "Sample 1% of the file randomly and count frequencies in the sample", "tag": "misconception_sampling"}
        ],
        "correct_index": 1,
        "concepts_tested": ["external_algorithms", "map_reduce", "heap", "large_scale_processing"],
        "misconceptions_detected": {"0": "ignore_memory_constraint", "2": "full_sort_impractical", "3": "sampling_for_exact_top_k"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 3,
        "stem": "You are implementing an autocomplete feature. As the user types, you need to quickly find all words starting with the typed prefix. Which data structure is best?",
        "options": [
            {"text": "A sorted array with binary search", "tag": "misconception_binary_search"},
            {"text": "A trie (prefix tree)", "tag": "correct"},
            {"text": "A hash map with all words as keys", "tag": "misconception_hash_map"},
            {"text": "A balanced BST", "tag": "misconception_bst"}
        ],
        "correct_index": 1,
        "concepts_tested": ["trie", "prefix_search", "data_structure_selection"],
        "misconceptions_detected": {"0": "binary_search_for_prefix", "2": "hash_map_for_prefix", "3": "bst_for_prefix"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 3,
        "stem": "You need to efficiently find the shortest path between two cities in a road network where roads have different distances. Which algorithm should you use?",
        "options": [
            {"text": "BFS (Breadth-First Search)", "tag": "misconception_bfs_weighted"},
            {"text": "Dijkstra's algorithm", "tag": "correct"},
            {"text": "DFS (Depth-First Search)", "tag": "misconception_dfs_shortest"},
            {"text": "Bubble sort on the edge weights", "tag": "misconception_sorting"}
        ],
        "correct_index": 1,
        "concepts_tested": ["dijkstra", "shortest_path", "weighted_graphs"],
        "misconceptions_detected": {"0": "bfs_for_weighted_graphs", "2": "dfs_for_shortest_path", "3": "sorting_for_shortest_path"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 3,
        "stem": "You have a stream of integers and need to efficiently find the median at any point. Which data structure combination works best?",
        "options": [
            {"text": "A sorted array that you binary-insert into", "tag": "misconception_sorted_array"},
            {"text": "Two heaps: a max-heap for the lower half and a min-heap for the upper half", "tag": "correct"},
            {"text": "A single linked list kept in sorted order", "tag": "misconception_sorted_linked_list"},
            {"text": "A hash map counting occurrences", "tag": "misconception_hash_count"}
        ],
        "correct_index": 1,
        "concepts_tested": ["streaming_median", "heaps", "online_algorithms"],
        "misconceptions_detected": {"0": "sorted_array_insertion", "2": "sorted_linked_list", "3": "hash_for_median"}
    },
    {
        "domain_slug": "data-structures-algorithms",
        "tier": 3,
        "stem": "You are designing a system where you need to check if a username already exists among 100 million usernames. Exact lookup must be fast, but you can tolerate a tiny false positive rate for a preliminary check. Which data structure would you use for the preliminary check?",
        "options": [
            {"text": "A hash set containing all usernames", "tag": "misconception_hash_set"},
            {"text": "A Bloom filter", "tag": "correct"},
            {"text": "A binary search tree", "tag": "misconception_bst"},
            {"text": "A trie with all usernames", "tag": "misconception_trie"}
        ],
        "correct_index": 1,
        "concepts_tested": ["bloom_filter", "probabilistic_data_structures", "space_efficiency"],
        "misconceptions_detected": {"0": "hash_set_for_space", "2": "bst_for_membership", "3": "trie_for_membership"}
    },

    # =========================================================================
    # DOMAIN: databases-sql (15 questions)
    # =========================================================================

    # --- Tier 1: Foundational ---
    {
        "domain_slug": "databases-sql",
        "tier": 1,
        "stem": "What does the SQL keyword SELECT do?",
        "options": [
            {"text": "Inserts new rows into a table", "tag": "misconception_insert"},
            {"text": "Retrieves data from one or more tables", "tag": "correct"},
            {"text": "Deletes rows from a table", "tag": "misconception_delete"},
            {"text": "Creates a new table", "tag": "misconception_create"}
        ],
        "correct_index": 1,
        "concepts_tested": ["select_statement", "sql_basics"],
        "misconceptions_detected": {"0": "select_vs_insert", "2": "select_vs_delete", "3": "select_vs_create"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 1,
        "stem": "What is a primary key?",
        "options": [
            {"text": "The most important column in a table", "tag": "misconception_importance"},
            {"text": "A column (or set of columns) that uniquely identifies each row in a table", "tag": "correct"},
            {"text": "The first column in any table", "tag": "misconception_first_column"},
            {"text": "A password used to access the database", "tag": "misconception_password"}
        ],
        "correct_index": 1,
        "concepts_tested": ["primary_key", "uniqueness", "table_design"],
        "misconceptions_detected": {"0": "pk_is_importance", "2": "pk_is_first_column", "3": "pk_is_password"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 1,
        "stem": "What does a JOIN operation do in SQL?",
        "options": [
            {"text": "Merges two databases into one", "tag": "misconception_merge_databases"},
            {"text": "Combines rows from two or more tables based on a related column", "tag": "correct"},
            {"text": "Adds new columns to an existing table", "tag": "misconception_alter"},
            {"text": "Copies data from one table to another", "tag": "misconception_copy"}
        ],
        "correct_index": 1,
        "concepts_tested": ["joins", "relational_model", "table_relationships"],
        "misconceptions_detected": {"0": "join_merges_databases", "2": "join_adds_columns", "3": "join_copies_data"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 1,
        "stem": "What is the difference between WHERE and HAVING in SQL?",
        "options": [
            {"text": "They are the same thing", "tag": "misconception_same"},
            {"text": "WHERE filters rows before grouping; HAVING filters groups after aggregation", "tag": "correct"},
            {"text": "WHERE is for numbers and HAVING is for text", "tag": "misconception_data_type"},
            {"text": "HAVING is faster than WHERE", "tag": "misconception_performance"}
        ],
        "correct_index": 1,
        "concepts_tested": ["where_vs_having", "group_by", "aggregation"],
        "misconceptions_detected": {"0": "where_having_same", "2": "filter_by_data_type", "3": "having_is_faster"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 1,
        "stem": "What does NULL represent in a database?",
        "options": [
            {"text": "The number zero", "tag": "misconception_zero"},
            {"text": "An unknown or missing value", "tag": "correct"},
            {"text": "An empty string", "tag": "misconception_empty_string"},
            {"text": "A deleted record", "tag": "misconception_deleted"}
        ],
        "correct_index": 1,
        "concepts_tested": ["null_values", "missing_data", "three_valued_logic"],
        "misconceptions_detected": {"0": "null_is_zero", "2": "null_is_empty_string", "3": "null_is_deleted"}
    },

    # --- Tier 2: Conceptual ---
    {
        "domain_slug": "databases-sql",
        "tier": 2,
        "stem": "What is database normalization?",
        "options": [
            {"text": "Making all values lowercase", "tag": "misconception_lowercase"},
            {"text": "Organizing tables to reduce data redundancy and improve integrity by following normal forms", "tag": "correct"},
            {"text": "Scaling the database to handle more users", "tag": "misconception_scaling"},
            {"text": "Converting data types to a standard format", "tag": "misconception_type_conversion"}
        ],
        "correct_index": 1,
        "concepts_tested": ["normalization", "normal_forms", "data_integrity"],
        "misconceptions_detected": {"0": "normalization_is_lowercase", "2": "normalization_is_scaling", "3": "normalization_is_type_conversion"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 2,
        "stem": "What does an index do in a database, and what is the tradeoff?",
        "options": [
            {"text": "An index speeds up all operations with no downsides", "tag": "misconception_no_tradeoff"},
            {"text": "An index speeds up reads/lookups but slows down writes (INSERT/UPDATE/DELETE) and uses additional storage", "tag": "correct"},
            {"text": "An index rearranges the physical order of rows on disk", "tag": "misconception_physical_order"},
            {"text": "An index is only useful for primary keys", "tag": "misconception_pk_only"}
        ],
        "correct_index": 1,
        "concepts_tested": ["indexing", "read_write_tradeoff", "query_optimization"],
        "misconceptions_detected": {"0": "index_no_tradeoff", "2": "index_is_physical_sort", "3": "index_pk_only"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 2,
        "stem": "What does ACID stand for in database transactions?",
        "options": [
            {"text": "Automatic, Consistent, Independent, Durable", "tag": "misconception_wrong_acronym"},
            {"text": "Atomicity, Consistency, Isolation, Durability", "tag": "correct"},
            {"text": "Available, Consistent, Isolated, Distributed", "tag": "misconception_cap_confusion"},
            {"text": "Asynchronous, Cached, Indexed, Deduplicated", "tag": "misconception_wrong_2"}
        ],
        "correct_index": 1,
        "concepts_tested": ["acid_properties", "transactions", "database_guarantees"],
        "misconceptions_detected": {"0": "wrong_acid_acronym", "2": "acid_cap_confusion", "3": "wrong_acid_acronym_2"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 2,
        "stem": "What is the difference between an INNER JOIN and a LEFT JOIN?",
        "options": [
            {"text": "INNER JOIN is faster", "tag": "misconception_speed"},
            {"text": "INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table plus matching rows from the right (with NULLs for non-matches)", "tag": "correct"},
            {"text": "LEFT JOIN returns fewer rows than INNER JOIN", "tag": "misconception_fewer_rows"},
            {"text": "There is no difference; they are interchangeable", "tag": "misconception_same"}
        ],
        "correct_index": 1,
        "concepts_tested": ["inner_join", "left_join", "join_types"],
        "misconceptions_detected": {"0": "inner_faster", "2": "left_fewer_rows", "3": "joins_interchangeable"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 2,
        "stem": "When would you denormalize a database?",
        "options": [
            {"text": "Always; denormalized databases are better", "tag": "misconception_always"},
            {"text": "When read performance is critical and you are willing to accept some data redundancy to avoid expensive joins", "tag": "correct"},
            {"text": "When the database has too many tables", "tag": "misconception_table_count"},
            {"text": "When you want to improve write performance", "tag": "misconception_write_perf"}
        ],
        "correct_index": 1,
        "concepts_tested": ["denormalization", "read_optimization", "tradeoffs"],
        "misconceptions_detected": {"0": "denorm_always_better", "2": "denorm_table_count", "3": "denorm_for_writes"}
    },

    # --- Tier 3: Applied ---
    {
        "domain_slug": "databases-sql",
        "tier": 3,
        "stem": "You have a users table with 50 million rows. The query `SELECT * FROM users WHERE email = 'user@example.com'` takes 30 seconds. What is the most likely fix?",
        "options": [
            {"text": "Add more RAM to the server", "tag": "misconception_more_ram"},
            {"text": "Create an index on the email column", "tag": "correct"},
            {"text": "Switch to a NoSQL database", "tag": "misconception_switch_db"},
            {"text": "Use SELECT email instead of SELECT *", "tag": "misconception_select_columns"}
        ],
        "correct_index": 1,
        "concepts_tested": ["query_optimization", "indexing", "slow_query_diagnosis"],
        "misconceptions_detected": {"0": "ram_fixes_queries", "2": "nosql_fixes_slow_queries", "3": "column_selection_fixes_scan"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 3,
        "stem": "Write a SQL query to find all departments where the average salary is above 75,000. Tables: employees(id, name, salary, dept_id), departments(id, name). Which query is correct?",
        "options": [
            {"text": "SELECT d.name FROM departments d JOIN employees e ON d.id = e.dept_id WHERE AVG(e.salary) > 75000", "tag": "misconception_where_with_aggregate"},
            {"text": "SELECT d.name FROM departments d JOIN employees e ON d.id = e.dept_id GROUP BY d.name HAVING AVG(e.salary) > 75000", "tag": "correct"},
            {"text": "SELECT d.name, AVG(salary) FROM employees GROUP BY dept_id HAVING salary > 75000", "tag": "misconception_having_non_aggregate"},
            {"text": "SELECT * FROM employees WHERE salary > 75000 GROUP BY dept_id", "tag": "misconception_filter_individuals"}
        ],
        "correct_index": 1,
        "concepts_tested": ["group_by", "having", "aggregate_functions", "join"],
        "misconceptions_detected": {"0": "where_with_aggregate_function", "2": "having_on_non_aggregate", "3": "filter_individuals_not_groups"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 3,
        "stem": "You need to insert 1 million rows into a PostgreSQL table. Which approach is fastest?",
        "options": [
            {"text": "1 million individual INSERT statements in a loop", "tag": "misconception_individual_inserts"},
            {"text": "A single COPY command or bulk insert with batched multi-row VALUES", "tag": "correct"},
            {"text": "Create a stored procedure that inserts one row at a time", "tag": "misconception_stored_proc"},
            {"text": "Use an ORM to insert each row as a Python object", "tag": "misconception_orm_loop"}
        ],
        "correct_index": 1,
        "concepts_tested": ["bulk_operations", "copy_command", "performance_optimization"],
        "misconceptions_detected": {"0": "individual_inserts", "2": "stored_proc_loop", "3": "orm_loop"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 3,
        "stem": "Your application has a race condition: two users are trying to book the last available ticket simultaneously. Both read 'available = 1', both proceed to book. How do you prevent this?",
        "options": [
            {"text": "Add a unique index on the ticket", "tag": "misconception_unique_index"},
            {"text": "Use a transaction with SELECT ... FOR UPDATE (row-level locking) or an atomic UPDATE with a WHERE condition", "tag": "correct"},
            {"text": "Add a check in the application code before inserting", "tag": "misconception_app_check"},
            {"text": "Use eventually consistent reads", "tag": "misconception_eventual_consistency"}
        ],
        "correct_index": 1,
        "concepts_tested": ["concurrency", "transactions", "row_locking", "race_conditions"],
        "misconceptions_detected": {"0": "unique_index_prevents_race", "2": "app_level_check_sufficient", "3": "eventual_consistency_prevents_race"}
    },
    {
        "domain_slug": "databases-sql",
        "tier": 3,
        "stem": "You have a table with columns (user_id, action, timestamp). You need to find the most recent action for each user. Which approach is most efficient?",
        "options": [
            {"text": "SELECT * FROM actions ORDER BY timestamp DESC and iterate in code to pick the first per user", "tag": "misconception_app_dedup"},
            {"text": "Use a window function: SELECT DISTINCT ON (user_id) * FROM actions ORDER BY user_id, timestamp DESC (PostgreSQL) or ROW_NUMBER() OVER", "tag": "correct"},
            {"text": "Create a temporary table for each user", "tag": "misconception_temp_tables"},
            {"text": "Use GROUP BY user_id and SELECT MAX(timestamp)", "tag": "misconception_group_by_max"}
        ],
        "correct_index": 1,
        "concepts_tested": ["window_functions", "distinct_on", "row_number", "advanced_sql"],
        "misconceptions_detected": {"0": "dedup_in_application", "2": "temp_table_per_user", "3": "group_by_loses_other_columns"}
    },
]


def seed():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    sb = create_client(url, key)

    # 1. Upsert missing domains
    existing_domains_res = sb.table("diagnostic_domains").select("slug").execute()
    existing_domains = {d["slug"] for d in existing_domains_res.data}
    
    unique_domains = set(q["domain_slug"] for q in QUESTIONS)
    missing_domains = unique_domains - existing_domains
    if missing_domains:
        print(f"Adding {len(missing_domains)} missing domains to diagnostic_domains table...")
        domain_rows = []
        for slug in missing_domains:
            name = slug.replace("-", " ").title()
            domain_rows.append({"slug": slug, "name": name, "description": f"{name} domain"})
        sb.table("diagnostic_domains").insert(domain_rows).execute()

    # 2. Check if questions already exist
    existing = sb.table("diagnostic_questions").select("id", count="exact").execute()
    if existing.count and existing.count > 0:
        print(f"Already have {existing.count} questions in the database. Deleting them...")
        sb.table("diagnostic_responses").delete().neq("id", -1).execute()
        sb.table("diagnostic_questions").delete().neq("id", -1).execute()

    # 3. Insert questions
    inserted = 0
    for q in QUESTIONS:
        row = {
            "domain_slug": q["domain_slug"],
            "tier": q["tier"],
            "stem": q["stem"],
            "options": q["options"],
            "correct_index": q["correct_index"],
            "concepts_tested": q["concepts_tested"],
            "misconceptions_detected": q["misconceptions_detected"],
        }
        sb.table("diagnostic_questions").insert(row).execute()
        inserted += 1

    print(f"Seeded {inserted} diagnostic questions across {len(unique_domains)} domains.")

    # Print summary
    from collections import Counter
    domain_counts = Counter(q["domain_slug"] for q in QUESTIONS)
    tier_counts = Counter((q["domain_slug"], q["tier"]) for q in QUESTIONS)
    for domain, count in domain_counts.items():
        t1 = tier_counts.get((domain, 1), 0)
        t2 = tier_counts.get((domain, 2), 0)
        t3 = tier_counts.get((domain, 3), 0)
        print(f"  {domain}: {count} questions (T1={t1}, T2={t2}, T3={t3})")


if __name__ == "__main__":
    seed()

// ======================================================
// Vestigium Phase 2 - Neo4j Automated Knowledge Graph Import
// ======================================================

// 1. Create Unique Constraints
CREATE CONSTRAINT unique_node_id IF NOT EXISTS FOR (n:Entity) REQUIRE n.id IS UNIQUE;

// 2. Merge Nodes
MERGE (n:Vulnerability {id: 'vuln-cve-2021-44228'}) ON CREATE SET n.name = 'CVE-2021-44228', n.properties = '{"cvss": 10.0, "severity": "CRITICAL", "cve_id": "CVE-2021-44228", "published": "2021-12-10T10:15:00"}', n:Entity ON MATCH SET n.properties = '{"cvss": 10.0, "severity": "CRITICAL", "cve_id": "CVE-2021-44228", "published": "2021-12-10T10:15:00"}';
MERGE (n:Software {id: 'software-apache-log4j'}) ON CREATE SET n.name = 'Apache Log4j2', n.properties = '{"ecosystem": "maven", "affected_versions": "2.0-beta9 <= 2.14.1"}', n:Entity ON MATCH SET n.properties = '{"ecosystem": "maven", "affected_versions": "2.0-beta9 <= 2.14.1"}';
MERGE (n:AttackVector {id: 'vector-ldap-jndi'}) ON CREATE SET n.name = 'LDAP JNDI Lookup Injection', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Weakness {id: 'weakness-cwe-502'}) ON CREATE SET n.name = 'CWE-502: Deserialization of Untrusted Data', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Impact {id: 'impact-remote-code-execution'}) ON CREATE SET n.name = 'Remote Code Execution', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Mitigation {id: 'mitigation-upgrade-log4j'}) ON CREATE SET n.name = 'Upgrade to log4j-core >= 2.17.1', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:ThreatActor {id: 'actor-remote-unauthenticated'}) ON CREATE SET n.name = 'Unauthenticated Remote Adversary', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Vulnerability {id: 'vuln-cve-2022-23529'}) ON CREATE SET n.name = 'CVE-2022-23529', n.properties = '{"cvss": 9.8, "severity": "CRITICAL", "cve_id": "CVE-2022-23529", "published": "2022-12-21T19:15:00"}', n:Entity ON MATCH SET n.properties = '{"cvss": 9.8, "severity": "CRITICAL", "cve_id": "CVE-2022-23529", "published": "2022-12-21T19:15:00"}';
MERGE (n:Software {id: 'software-jsonwebtoken'}) ON CREATE SET n.name = 'jsonwebtoken (Node.js)', n.properties = '{"ecosystem": "npm", "affected_versions": "<= 8.5.1"}', n:Entity ON MATCH SET n.properties = '{"ecosystem": "npm", "affected_versions": "<= 8.5.1"}';
MERGE (n:AttackVector {id: 'vector-tostring-injection'}) ON CREATE SET n.name = 'Crafted secretOrPublicKey Parameter', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Weakness {id: 'weakness-cwe-94'}) ON CREATE SET n.name = 'CWE-94: Code Injection', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Impact {id: 'impact-rce'}) ON CREATE SET n.name = 'Arbitrary Remote Code Execution', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Mitigation {id: 'mitigation-upgrade-jsonwebtoken'}) ON CREATE SET n.name = 'Upgrade jsonwebtoken to >= 9.0.0', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Vulnerability {id: 'vuln-cve-2024-3094'}) ON CREATE SET n.name = 'CVE-2024-3094', n.properties = '{"cvss": 10.0, "severity": "CRITICAL", "cve_id": "CVE-2024-3094", "published": "2024-03-29T16:15:00"}', n:Entity ON MATCH SET n.properties = '{"cvss": 10.0, "severity": "CRITICAL", "cve_id": "CVE-2024-3094", "published": "2024-03-29T16:15:00"}';
MERGE (n:Software {id: 'software-xz-utils'}) ON CREATE SET n.name = 'XZ Utils (liblzma)', n.properties = '{"ecosystem": "c/c++", "affected_versions": "5.6.0 - 5.6.1"}', n:Entity ON MATCH SET n.properties = '{"ecosystem": "c/c++", "affected_versions": "5.6.0 - 5.6.1"}';
MERGE (n:Software {id: 'software-openssh-sshd'}) ON CREATE SET n.name = 'OpenSSH sshd', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:AttackVector {id: 'vector-build-backdoor'}) ON CREATE SET n.name = 'Obfuscated M4 Macro Payload', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Impact {id: 'impact-ssh-auth-bypass'}) ON CREATE SET n.name = 'Pre-Authentication Root Compromise', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Mitigation {id: 'mitigation-downgrade-xz'}) ON CREATE SET n.name = 'Revert xz-utils to 5.4.x', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Vulnerability {id: 'vuln-cve-2023-38606'}) ON CREATE SET n.name = 'CVE-2023-38606', n.properties = '{"cvss": 7.8, "severity": "HIGH", "cve_id": "CVE-2023-38606", "published": "2023-07-24T18:15:00"}', n:Entity ON MATCH SET n.properties = '{"cvss": 7.8, "severity": "HIGH", "cve_id": "CVE-2023-38606", "published": "2023-07-24T18:15:00"}';
MERGE (n:Software {id: 'software-cve'}) ON CREATE SET n.name = 'CVE', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Impact {id: 'impact-service-compromise'}) ON CREATE SET n.name = 'System Integrity Compromise', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';
MERGE (n:Mitigation {id: 'mitigation-apply-security-patch'}) ON CREATE SET n.name = 'Apply Vendor Security Patch', n.properties = '{}', n:Entity ON MATCH SET n.properties = '{}';

// 3. Merge Edges
MATCH (s:Entity {id: 'vuln-cve-2021-44228'}), (t:Entity {id: 'software-apache-log4j'}) MERGE (s)-[:AFFECTS]->(t);
MATCH (s:Entity {id: 'vuln-cve-2021-44228'}), (t:Entity {id: 'vector-ldap-jndi'}) MERGE (s)-[:EXPLOITED_VIA]->(t);
MATCH (s:Entity {id: 'vuln-cve-2021-44228'}), (t:Entity {id: 'weakness-cwe-502'}) MERGE (s)-[:EXEMPLIFIES]->(t);
MATCH (s:Entity {id: 'vuln-cve-2021-44228'}), (t:Entity {id: 'impact-remote-code-execution'}) MERGE (s)-[:LEADS_TO]->(t);
MATCH (s:Entity {id: 'vuln-cve-2021-44228'}), (t:Entity {id: 'mitigation-upgrade-log4j'}) MERGE (s)-[:MITIGATED_BY]->(t);
MATCH (s:Entity {id: 'vuln-cve-2021-44228'}), (t:Entity {id: 'actor-remote-unauthenticated'}) MERGE (s)-[:ATTEMPTED_BY]->(t);
MATCH (s:Entity {id: 'vuln-cve-2022-23529'}), (t:Entity {id: 'software-jsonwebtoken'}) MERGE (s)-[:AFFECTS]->(t);
MATCH (s:Entity {id: 'vuln-cve-2022-23529'}), (t:Entity {id: 'vector-tostring-injection'}) MERGE (s)-[:EXPLOITED_VIA]->(t);
MATCH (s:Entity {id: 'vuln-cve-2022-23529'}), (t:Entity {id: 'weakness-cwe-94'}) MERGE (s)-[:EXEMPLIFIES]->(t);
MATCH (s:Entity {id: 'vuln-cve-2022-23529'}), (t:Entity {id: 'impact-rce'}) MERGE (s)-[:LEADS_TO]->(t);
MATCH (s:Entity {id: 'vuln-cve-2022-23529'}), (t:Entity {id: 'mitigation-upgrade-jsonwebtoken'}) MERGE (s)-[:MITIGATED_BY]->(t);
MATCH (s:Entity {id: 'vuln-cve-2022-23529'}), (t:Entity {id: 'actor-remote-unauthenticated'}) MERGE (s)-[:ATTEMPTED_BY]->(t);
MATCH (s:Entity {id: 'vuln-cve-2024-3094'}), (t:Entity {id: 'software-xz-utils'}) MERGE (s)-[:AFFECTS]->(t);
MATCH (s:Entity {id: 'software-openssh-sshd'}), (t:Entity {id: 'software-xz-utils'}) MERGE (s)-[:DEPENDS_ON]->(t);
MATCH (s:Entity {id: 'vuln-cve-2024-3094'}), (t:Entity {id: 'vector-build-backdoor'}) MERGE (s)-[:EXPLOITED_VIA]->(t);
MATCH (s:Entity {id: 'vuln-cve-2024-3094'}), (t:Entity {id: 'impact-ssh-auth-bypass'}) MERGE (s)-[:LEADS_TO]->(t);
MATCH (s:Entity {id: 'vuln-cve-2024-3094'}), (t:Entity {id: 'mitigation-downgrade-xz'}) MERGE (s)-[:MITIGATED_BY]->(t);
MATCH (s:Entity {id: 'vuln-cve-2024-3094'}), (t:Entity {id: 'actor-remote-unauthenticated'}) MERGE (s)-[:ATTEMPTED_BY]->(t);
MATCH (s:Entity {id: 'vuln-cve-2023-38606'}), (t:Entity {id: 'software-cve'}) MERGE (s)-[:AFFECTS]->(t);
MATCH (s:Entity {id: 'vuln-cve-2023-38606'}), (t:Entity {id: 'impact-service-compromise'}) MERGE (s)-[:LEADS_TO]->(t);
MATCH (s:Entity {id: 'vuln-cve-2023-38606'}), (t:Entity {id: 'mitigation-apply-security-patch'}) MERGE (s)-[:MITIGATED_BY]->(t);
MATCH (s:Entity {id: 'vuln-cve-2023-38606'}), (t:Entity {id: 'actor-remote-unauthenticated'}) MERGE (s)-[:ATTEMPTED_BY]->(t);

import requests
import time
from typing import List, Dict, Any, Optional

NVD_API_ENDPOINT = "https://services.nvd.nist.gov/rest/json/cves/2.0"

OFFLINE_BENCHMARK_CVES: List[Dict[str, Any]] = [
    {
        "id": "CVE-2021-44228",
        "source": "Apache Security Advisory / NVD",
        "description": (
            "Apache Log4j2 versions 2.0-beta9 through 2.14.1 JNDI features used in configuration, "
            "log messages, and parameters do not protect against attacker controlled LDAP and other "
            "JNDI related endpoints. An unauthenticated remote attacker who can control log messages "
            "or log message parameters can execute arbitrary code loaded from LDAP servers when message "
            "lookup substitution is enabled. From log4j 2.15.0, this behavior has been disabled by default. "
            "Remediation requires upgrading to log4j-core 2.17.1 or setting -Dlog4j2.formatMsgNoLookups=true."
        ),
        "cvss": 10.0,
        "severity": "CRITICAL",
        "published": "2021-12-10T10:15:00"
    },
    {
        "id": "CVE-2022-23529",
        "source": "Auth0 / NVD Advisory",
        "description": (
            "jsonwebtoken is an open source library to sign and verify JSON Web Tokens. In versions <= 8.5.1, "
            "an unauthenticated attacker who can control the secretOrPublicKey parameter passed to jwt.verify() "
            "can trigger Remote Code Execution by supplying an object with an arbitrary toString getter implementation. "
            "This vulnerability exemplifies improper control of generation of code (CWE-94). "
            "Mitigation: Upgrade jsonwebtoken dependency to version 9.0.0 or later, and validate that secret keys "
            "are strict string or Buffer types."
        ),
        "cvss": 9.8,
        "severity": "CRITICAL",
        "published": "2022-12-21T19:15:00"
    },
    {
        "id": "CVE-2024-3094",
        "source": "Openwall / CISA Alert",
        "description": (
            "Malicious code was discovered in the upstream tarballs of XZ Utils (liblzma) starting with versions "
            "5.6.0 and 5.6.1. Through a multi-stage obfuscated build script payload, the malicious build modifies "
            "functions in liblzma to intercept RSA decryption inside OpenSSH sshd daemon processes on systemd-linked "
            "glibc Linux systems. An unauthorized remote adversary possessing the attacker's private key can execute "
            "pre-authentication arbitrary commands as root. Remediation: Downgrade xz-utils to version 5.4.x immediately."
        ),
        "cvss": 10.0,
        "severity": "CRITICAL",
        "published": "2024-03-29T16:15:00"
    },
    {
        "id": "CVE-2023-38606",
        "source": "Apple Security Disclosure / Kaspersky",
        "description": (
            "An issue in the Apple iOS Kernel allowed a malicious application with kernel read/write access to bypass "
            "hardware memory protection registers (Page Table Isolation). Exploited in the wild in Operation Triangulation "
            "as a zero-click iMessage attachment exploit chain to achieve root device compromise on iPhone hardware. "
            "Remediation: Patched in iOS 16.6 and iPadOS 16.6 by removing unused hardware memory-mapped I/O test registers."
        ),
        "cvss": 7.8,
        "severity": "HIGH",
        "published": "2023-07-24T18:15:00"
    }
]

class NVDFetcher:
    """
    Client for the National Vulnerability Database (NVD) API v2.0
    with graceful offline benchmark fallback.
    """

    @staticmethod
    def fetch_live_cves(
        limit: int = 5,
        keyword: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Queries NVD API v2.0 for recent vulnerability reports.
        """
        params: Dict[str, Any] = {
            "resultsPerPage": min(limit, 20),
            "startIndex": 0,
        }
        if keyword:
            params["keywordSearch"] = keyword

        headers = {
            "User-Agent": "Vestigium-Vulnerability-Cartographer/2.0"
        }
        if api_key:
            headers["apiKey"] = api_key

        try:
            response = requests.get(
                NVD_API_ENDPOINT,
                params=params,
                headers=headers,
                timeout=12.0
            )
            response.raise_for_status()
            data = response.json()

            cves: List[Dict[str, Any]] = []
            vulnerabilities = data.get("vulnerabilities", [])

            for item in vulnerabilities:
                cve = item.get("cve", {})
                cve_id = cve.get("id", "UNKNOWN-CVE")
                descriptions = cve.get("descriptions", [])
                
                # Retrieve English description
                desc_text = ""
                for d in descriptions:
                    if d.get("lang") == "en":
                        desc_text = d.get("value", "")
                        break
                if not desc_text and descriptions:
                    desc_text = descriptions[0].get("value", "")

                metrics = cve.get("metrics", {})
                cvss_score = 0.0
                severity = "UNKNOWN"

                # Parse CVSS v3.1 or v3.0
                cvss_data = metrics.get("cvssMetricV31", []) or metrics.get("cvssMetricV30", [])
                if cvss_data:
                    primary_metric = cvss_data[0].get("cvssData", {})
                    cvss_score = primary_metric.get("baseScore", 0.0)
                    severity = primary_metric.get("baseSeverity", "UNKNOWN")

                cves.append({
                    "id": cve_id,
                    "source": "NVD API Live Ingestion",
                    "description": desc_text,
                    "cvss": cvss_score,
                    "severity": severity,
                    "published": cve.get("published", "")
                })

            return cves

        except Exception as err:
            print(f"[WARN] Live NVD API query encountered: {err}. Defaulting to verified offline benchmark corpus.")
            return []

    @classmethod
    def get_cve_corpus(
        cls,
        use_live_api: bool = False,
        limit: int = 4,
        keyword: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves CVE reports, querying live NVD if requested,
        otherwise returning the curated benchmark set.
        """
        if use_live_api:
            live_results = cls.fetch_live_cves(limit=limit, keyword=keyword, api_key=api_key)
            if live_results:
                return live_results[:limit]
        
        # Return offline benchmark
        return OFFLINE_BENCHMARK_CVES[:limit]

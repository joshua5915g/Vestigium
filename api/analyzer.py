import os
import ast
import re
import json
from typing import Dict, Any, List, Optional, Set

class CodeAnalyzer:
    """
    Static Code & AST Analyzer.
    Parses manifest dependencies and source files (Python AST & JS/TS imports/call-sites)
    to build an internal code execution and dependency graph.
    """

    @classmethod
    def analyze_path(cls, root_path: str) -> Dict[str, Any]:
        """
        Scans a project directory or file and constructs the code AST knowledge graph.
        """
        if not os.path.exists(root_path):
            raise ValueError(f"Target path does not exist: {root_path}")

        nodes: Dict[str, Dict[str, Any]] = {}
        edges: List[Dict[str, Any]] = []

        manifest_packages: Dict[str, Dict[str, Any]] = {}

        # 1. Parse Dependency Manifests
        if os.path.isdir(root_path):
            manifest_packages.update(cls._parse_python_manifests(root_path))
            manifest_packages.update(cls._parse_node_manifests(root_path))
        elif root_path.endswith("requirements.txt"):
            manifest_packages.update(cls._parse_requirements_file(root_path))
        elif root_path.endswith("package.json"):
            manifest_packages.update(cls._parse_package_json_file(root_path))

        # Register Package nodes
        for pkg_name, pkg_info in manifest_packages.items():
            pkg_id = f"pkg-{pkg_name.lower()}"
            nodes[pkg_id] = {
                "id": pkg_id,
                "name": pkg_name,
                "label": "Package",
                "properties": {
                    "ecosystem": pkg_info.get("ecosystem", "unknown"),
                    "version": pkg_info.get("version", "*"),
                    "manifest": pkg_info.get("manifest", "")
                }
            }

        # 2. Parse Source Files (Python & JS/TS)
        source_files = cls._collect_source_files(root_path)

        for filepath in source_files:
            rel_path = os.path.relpath(filepath, root_path) if os.path.isdir(root_path) else os.path.basename(filepath)
            file_id = f"file-{rel_path.replace(os.sep, '/').lower()}"
            
            nodes[file_id] = {
                "id": file_id,
                "name": rel_path.replace(os.sep, "/"),
                "label": "SourceFile",
                "properties": {
                    "path": filepath,
                    "extension": os.path.splitext(filepath)[1]
                }
            }

            if filepath.endswith(".py"):
                cls._parse_python_file(filepath, file_id, nodes, edges, manifest_packages)
            elif filepath.endswith((".js", ".jsx", ".ts", ".tsx")):
                cls._parse_js_file(filepath, file_id, nodes, edges, manifest_packages)

        return {
            "root_path": root_path,
            "manifest_packages": list(manifest_packages.keys()),
            "nodes": list(nodes.values()),
            "edges": edges
        }

    @classmethod
    def _collect_source_files(cls, root_path: str) -> List[str]:
        if os.path.isfile(root_path):
            return [root_path]

        collected: List[str] = []
        ignored_dirs = {".git", "node_modules", "__pycache__", "venv", ".venv", "dist", "build", ".next"}

        for root, dirs, files in os.walk(root_path):
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            for f in files:
                if f.endswith((".py", ".js", ".jsx", ".ts", ".tsx")) and not f.endswith(".min.js"):
                    collected.append(os.path.join(root, f))
                    if len(collected) >= 150:  # Safety cap for large repos
                        return collected
        return collected

    @classmethod
    def _parse_requirements_file(cls, filepath: str) -> Dict[str, Dict[str, Any]]:
        pkgs: Dict[str, Dict[str, Any]] = {}
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    # Match package name and version e.g. requests>=2.31.0
                    match = re.match(r"^([a-zA-Z0-9_\-\.]+)(?:([=<>!~]+.*))?$", line)
                    if match:
                        name = match.group(1).lower()
                        ver = match.group(2) or "*"
                        pkgs[name] = {"ecosystem": "pypi", "version": ver, "manifest": filepath}
        except Exception:
            pass
        return pkgs

    @classmethod
    def _parse_python_manifests(cls, dir_path: str) -> Dict[str, Dict[str, Any]]:
        pkgs: Dict[str, Dict[str, Any]] = {}
        req_path = os.path.join(dir_path, "requirements.txt")
        if os.path.exists(req_path):
            pkgs.update(cls._parse_requirements_file(req_path))
        return pkgs

    @classmethod
    def _parse_package_json_file(cls, filepath: str) -> Dict[str, Dict[str, Any]]:
        pkgs: Dict[str, Dict[str, Any]] = {}
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                data = json.load(f)
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                for name, ver in deps.items():
                    pkgs[name.lower()] = {"ecosystem": "npm", "version": ver, "manifest": filepath}
        except Exception:
            pass
        return pkgs

    @classmethod
    def _parse_node_manifests(cls, dir_path: str) -> Dict[str, Dict[str, Any]]:
        pkg_path = os.path.join(dir_path, "package.json")
        if os.path.exists(pkg_path):
            return cls._parse_package_json_file(pkg_path)
        return {}

    @classmethod
    def _parse_python_file(
        cls,
        filepath: str,
        file_id: str,
        nodes: Dict[str, Dict[str, Any]],
        edges: List[Dict[str, Any]],
        manifest_pkgs: Dict[str, Dict[str, Any]]
    ):
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            tree = ast.parse(content, filename=filepath)
        except Exception:
            return

        # Map file-level imports
        file_imports: Set[str] = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    pkg = alias.name.split(".")[0].lower()
                    file_imports.add(pkg)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    pkg = node.module.split(".")[0].lower()
                    file_imports.add(pkg)

        # Connect File to Imported Packages
        for pkg in file_imports:
            pkg_id = f"pkg-{pkg}"
            if pkg_id not in nodes:
                nodes[pkg_id] = {
                    "id": pkg_id,
                    "name": pkg,
                    "label": "Package",
                    "properties": {"ecosystem": "pypi", "version": "*"}
                }
            edges.append({
                "source": file_id,
                "target": pkg_id,
                "relationship_type": "IMPORTS",
                "properties": {"scope": "file_import"}
            })

        # Parse Functions and internal calls
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                fn_name = node.name
                fn_id = f"fn-{file_id}-{fn_name}"

                nodes[fn_id] = {
                    "id": fn_id,
                    "name": f"{fn_name}()",
                    "label": "Function",
                    "properties": {
                        "file": file_id,
                        "line": node.lineno,
                        "is_async": isinstance(node, ast.AsyncFunctionDef)
                    }
                }

                # File contains Function
                edges.append({
                    "source": file_id,
                    "target": fn_id,
                    "relationship_type": "CONTAINS",
                    "properties": {"line": node.lineno}
                })

                # Check calls inside function
                for subnode in ast.walk(node):
                    if isinstance(subnode, ast.Call):
                        # Detect call to imported package
                        call_pkg = None
                        if isinstance(subnode.func, ast.Attribute) and isinstance(subnode.func.value, ast.Name):
                            if subnode.func.value.id.lower() in file_imports:
                                call_pkg = subnode.func.value.id.lower()
                        elif isinstance(subnode.func, ast.Name) and subnode.func.id.lower() in file_imports:
                            call_pkg = subnode.func.id.lower()

                        if call_pkg:
                            edges.append({
                                "source": fn_id,
                                "target": f"pkg-{call_pkg}",
                                "relationship_type": "CALLS",
                                "properties": {"call_line": getattr(subnode, "lineno", node.lineno)}
                            })

    @classmethod
    def _parse_js_file(
        cls,
        filepath: str,
        file_id: str,
        nodes: Dict[str, Dict[str, Any]],
        edges: List[Dict[str, Any]],
        manifest_pkgs: Dict[str, Dict[str, Any]]
    ):
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            return

        # Detect ES6 imports: import ... from 'pkg'
        es6_matches = re.findall(r"import\s+.*?from\s+['\"]([^'\"]+)['\"]", content)
        # Detect CommonJS requires: const ... = require('pkg')
        cjs_matches = re.findall(r"require\s*\(\s*['\"]([^'\"]+)['\"]\s*\)", content)

        all_imports = set()
        for imp in es6_matches + cjs_matches:
            if not imp.startswith("."):  # 3rd party package
                pkg_name = imp.split("/")[0] if not imp.startswith("@") else "/".join(imp.split("/")[:2])
                all_imports.add(pkg_name.lower())

        for pkg in all_imports:
            pkg_id = f"pkg-{pkg}"
            if pkg_id not in nodes:
                nodes[pkg_id] = {
                    "id": pkg_id,
                    "name": pkg,
                    "label": "Package",
                    "properties": {"ecosystem": "npm", "version": "*"}
                }
            edges.append({
                "source": file_id,
                "target": pkg_id,
                "relationship_type": "IMPORTS",
                "properties": {"scope": "module_import"}
            })

        # Detect Function Declarations
        fn_matches = re.findall(r"(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(", content)
        arrow_matches = re.findall(r"(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>", content)

        for fn_name in set(fn_matches + arrow_matches):
            fn_id = f"fn-{file_id}-{fn_name}"
            nodes[fn_id] = {
                "id": fn_id,
                "name": f"{fn_name}()",
                "label": "Function",
                "properties": {"file": file_id}
            }
            edges.append({
                "source": file_id,
                "target": fn_id,
                "relationship_type": "CONTAINS",
                "properties": {}
            })

            # Check if imported package is invoked in file
            for pkg in all_imports:
                if re.search(rf"\b{re.escape(pkg.split('/')[-1])}\b", content):
                    edges.append({
                        "source": fn_id,
                        "target": f"pkg-{pkg}",
                        "relationship_type": "CALLS",
                        "properties": {}
                    })

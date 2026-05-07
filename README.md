# @amlhubs/smof — SMOF 1.0 as a Typed Metamodel

## Identity

| Field | Value |
|---|---|
| Standard | MOF Support for Semantic Structures (SMOF) 1.0 |
| OMG Formal Document | [formal/2013-04-01](https://www.omg.org/spec/SMOF/1.0/) |
| OMG Specification | [omg.org/spec/SMOF/1.0](https://www.omg.org/spec/SMOF/1.0/) |
| Authority | Object Management Group (OMG) |
| npm Package | `@amlhubs/smof` |
| npm Version | `0.0.0` (scaffold) |
| Peer Dependencies | `@amlhubs/mof@^0.0.4`, `@amlhubs/uml@^0.0.2` |
| License | UNLICENSED |

## Abstract

The Object Management Group's MOF Support for Semantic Structures (SMOF) 1.0, formal/2013-04-01, defines the meta-metamodel layer that adds dynamically mutable multiple classification of model elements to MOF 2 — together with the declarative machinery that constrains when such multiple classifications are required, allowed, or prohibited. The specification also formalizes the powertype pattern as a first-class metamodel concept and defines its interaction with the MOF reflective protocol. SMOF is the OMG's bridge between the static, single-classification world of CMOF/EMOF and the open-world, evolution-aware semantics that domain-specific languages, ontology-aligned metamodels, and category-mutating systems require.

The `@amlhubs/smof` package projects every SMOF metaclass into TypeScript with full §-cited JSDoc per the OMG specification document. The package depends on [`@amlhubs/mof`](../mof/README.md) for the reflective substrate and on [`@amlhubs/uml`](../uml/README.md) for the structural vocabulary. This 0.0.0 release is the empty scaffold — the metaclasses themselves land in the next release.

## Business Value — Why Extending This Metamodel Pays Off

A typed SMOF package unlocks dynamic-multiple-classification semantics for any model registry that already speaks MOF — a structural step-up that the reference EMF/Ecore stack does not natively provide. Domain models that need to evolve an instance's classifier set at runtime (a `Person` becoming a `Customer` and then additionally a `Supplier` without losing identity) can express that mutation as a typed SMOF operation rather than as ad-hoc state. Powertype-aware tooling — ontology aligners, classification-driven validators, instance-level introspection engines — gains a normative metamodel surface to compile against.

ISO and ISO/IEC have not adopted SMOF as a separate standard, but its dependency on MOF (which is ISO/IEC 19508:2014) means SMOF-conformant model artifacts inherit the same regulatory grounding through transitive citation. Ventures whose model evolution semantics matter (compliance domains where role mutation is auditable, healthcare ontologies where classification migrates with diagnosis state, financial systems where counterparty roles overlap) benefit from an explicit, citable formal grounding for the multiple-classification semantics they already implement informally.

## Scope — What the Package Surfaces

The package will surface the SMOF metaclasses defined in formal/2013-04-01 with TypeScript interfaces and concrete classes. This 0.0.0 scaffold exposes only the file skeleton. Every metaclass added in 0.0.1+ will carry a JSDoc header citing the §-section of the specification, the OCL invariants from `CMOFConstraints.ocl` and `EMOFConstraints.ocl` that govern it, and the precise type bindings against `@amlhubs/mof` and `@amlhubs/uml`.

## Dependency Topology

```
@amlhubs/uml   (structural vocabulary — root of the stack)
      ▲
      │ peerDependency
      │
@amlhubs/mof   (reflective machinery over UML)
      ▲
      │ peerDependency
      │
@amlhubs/smof  (this package — multiple-classification + powertype semantics over MOF)
```

`@amlhubs/smof` declares both `@amlhubs/mof@^0.0.4` and `@amlhubs/uml@^0.0.2` as peer dependencies. The MOF dependency is necessary because SMOF specializes the MOF reflective substrate; the UML dependency is necessary because SMOF metaclasses inherit from UML structural types via MOF.

## Installation & Usage

```bash
npm install @amlhubs/smof @amlhubs/mof @amlhubs/uml
```

```typescript
// Imports will be wired in 0.0.1+ once the metaclasses ship.
// import type { ... } from '@amlhubs/smof';
```

The source artifact is [`smof.ts`](./smof.ts). The 0.0.0 scaffold contains the spec banner only.

## Provenance & Formal References

Every metaclass in this package will cite the SMOF 1.0 specification artifacts. The authoritative OMG-published artifact set:

- [SMOF 1.0 PDF (formal/2013-04-01)](https://www.omg.org/spec/SMOF/1.0/PDF)
- [SMOF.xmi (machine-readable metamodel)](https://www.omg.org/spec/SMOF/20120801/SMOF.xmi)
- [InfrastructureLibrary.mdxml](https://www.omg.org/spec/SMOF/20120820/InfrastructureLibrary.mdxml)
- [PrimitiveTypes.mdxml](https://www.omg.org/spec/SMOF/20120820/PrimitiveTypes.mdxml)
- [Superstructure.mdxml](https://www.omg.org/spec/SMOF/20120820/Superstructure.mdxml)
- [CMOFConstraints.ocl](https://www.omg.org/spec/SMOF/20120820/CMOFConstraints.ocl)
- [EMOFConstraints.ocl](https://www.omg.org/spec/SMOF/20120820/EMOFConstraints.ocl)

These artifacts will be mirrored under `./specs/` when the next subagent in the `/metamodel deploy smof` workflow scrapes them.

## Version History

| Version | Date | Notes |
|---|---|---|
| 0.0.0 | 2026-05 | Empty scaffold — package + tsconfig + LICENSE + README + smof.ts banner. Metaclasses land in 0.0.1. |

## License

UNLICENSED — published as a private GitHub Packages artifact under the `@amlhubs` scope. See [LICENSE](./LICENSE).

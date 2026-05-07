// ═══════════════════════════════════════════════════════════════════════════
// @amlhubs/smof — OMG MOF Support for Semantic Structures (SMOF) 1.0
// formal/2013-04-01 (April 2013) — https://www.omg.org/spec/SMOF/1.0/
//
// SMOF extends MOF 2 with the metamodel infrastructure required to support
// dynamically mutable multiple classification of elements, plus the
// declarative machinery that constrains when such multiple classifications
// are allowed, required, or prohibited. The spec also formalizes the
// powertype pattern and its interaction with MOF reflection.
//
// Spec source-of-truth (machine-readable):
//   ./specs/SMOF.xmi                       — the SMOF metamodel itself
//   ./specs/InfrastructureLibrary.mdxml    — MagicDraw extension surface
//   ./specs/PrimitiveTypes.mdxml           — primitive type bindings
//   ./specs/Superstructure.mdxml           — UML/MOF superstructure binding
//   ./specs/CMOFConstraints.ocl            — CMOF OCL invariants (§14.3)
//   ./specs/EMOFConstraints.ocl            — EMOF OCL invariants (§12.4)
//
// Authority: Object Management Group (OMG)
// Document number: formal/2013-04-01
// Status: Formal (April 2013)
//
// Dependencies (peerDependency):
//   @amlhubs/mof  ^0.0.4  — MOF 2.5.1 reflective substrate (CMOF + EMOF)
//   @amlhubs/uml  ^0.0.2  — UML 2.5.1 structural vocabulary
//
// Pattern: every metaclass is declared as an interface + abstract or concrete
// class. Three-layer pattern (per .claude/rules/convention/abstract-class.md)
// is applied wherever the metaclass admits parametric instantiation.
//
// JSDoc citations follow the project's @standard / @section / @metaclass /
// @generalization / @definition / @associationEnds / @ownedAttributes /
// @operations / @constraints set. Constraints from the OCL artifacts are
// cited verbatim by id where they govern the metaclass.
// ═══════════════════════════════════════════════════════════════════════════

// Implementation phase will INSERT every SMOF metaclass below this banner.
// Do not delete this file — extend it.

export {}

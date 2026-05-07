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

import type {
  IClass,
  IConstraint,
  IOpaqueExpression,
  IProperty,
  IPackage,
} from '@amlhubs/uml'
import type {
  IReflectionObject,
  IReflectionElement,
  IReflectionFactory,
} from '@amlhubs/mof'

// ═══════════════════════════════════════════════════════════════════════════
// A. SEMOF PACKAGE (§8.1, §9.1.2) — SMOF for EMOF Compliance
// SEMOF extends EMOF via «packageMerge» and adds the metaclasses required to
// support multiple, dynamically-mutable classification of Elements, plus the
// declarative Constraint flavor that expresses disjoint/equivalent relations
// between classifying metaclasses.
// ═══════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────
// A.1 — SMOF Constraint extension (§9.1.2.1)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofConstraintExtension — Constraint (as extended)
/**
 * @standard OMG SMOF 1.0 §9.1.2.1 Constraint (as extended)
 * @section §9.1.2.1
 * @metaclass concrete
 * @generalization UML::Constraint (via SEMOF «packageMerge»)
 * @definition The semantics of Constraint from MOF are extended to express
 *   disjoint and equivalent Classes. A Constraint with constrainedElements
 *   that are Classes, and with a `specification` that is an OpaqueExpression
 *   whose `language[0]` equals `'SMOF'` and whose `body[0]` is one of
 *   {`'disjoint'`, `'equivalent'`}, declares that the constrainedElements are
 *   respectively disjoint or equivalent.
 * @ownedAttributes
 *   (none introduced by SMOF — every attribute is inherited from
 *    UML::Constraint and bound by the body/language pair on `specification`.)
 * @operations
 *   disjointOrEquivalent() : 'disjoint' | 'equivalent' | undefined
 *     -- runtime classifier returning which flavor this Constraint declares
 *        (or `undefined` if the specification does not match the §9.1.2.1
 *        SMOF body/language convention).
 * @constraints
 *   (the body/language convention IS the constraint — a Constraint is an
 *   SMOF Constraint extension iff the predicate above holds on its
 *   `specification` OpaqueExpression.)
 */
export interface ISMOFConstraintExtension extends IConstraint {
  readonly metaClass: 'SMOFConstraint'
  /**
   * Runtime classifier that resolves the §9.1.2.1 body convention.
   * Returns `'disjoint'` if `specification.language[0] === 'SMOF'` and
   * `specification.body[0] === 'disjoint'`; `'equivalent'` for the symmetric
   * case; `undefined` otherwise.
   */
  disjointOrEquivalent(): 'disjoint' | 'equivalent' | undefined
}

/**
 * @standard OMG SMOF 1.0 §9.1.2.1 Constraint (as extended)
 * @section §9.1.2.1
 *
 * Helper that resolves the §9.1.2.1 body/language convention against an
 * already-resolved IOpaqueExpression. Pure metamodel-surface logic — no
 * UML registry binding required. Downstream consumers that materialize a
 * concrete UML Constraint may compose this helper into their `disjointOrEquivalent`
 * implementation by passing the resolved specification value.
 *
 * The metamodel surface deliberately does not author a concrete
 * `SMOFConstraintExtension` class because UML's IConstraint references its
 * specification by id (`specificationId`), and dereferencing requires a
 * domain-runtime registry the metamodel surface does not own. The interface
 * `ISMOFConstraintExtension` IS the metamodel-surface contract; downstream
 * consumers materialize.
 */
export const resolveSMOFDisjointOrEquivalent = (
  spec: IOpaqueExpression | undefined,
): 'disjoint' | 'equivalent' | undefined => {
  if (!spec) return undefined
  const lang = spec.languages?.[0]
  const body = spec.bodies?.[0]
  if (lang !== 'SMOF') return undefined
  if (body === 'disjoint') return 'disjoint'
  if (body === 'equivalent') return 'equivalent'
  return undefined
}

// ───────────────────────────────────────────────────────────────────────────
// A.2 — Element (as extended) (§9.1.2.2)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofElement<Payload> — Element (as extended)
/**
 * @standard OMG SMOF 1.0 §9.1.2.2 Element (as extended)
 * @section §9.1.2.2
 * @metaclass abstract
 * @generalization MOF::Reflection::Object
 * @definition Element is extended with a new operation getMetaClasses to
 *   return multiple values. The original getMetaClass operation is retained.
 *   If there is only one metaclass, then getMetaClass will return it;
 *   otherwise, an exception will be thrown. Two additional operations
 *   provide reclassification capabilities. Note that the existing operation
 *   isInstanceOf can still be used to check whether an Element conforms to
 *   a class.
 * @associationEnds
 *   /metaclass : Class [1..*] (A_element_metaclass) — derived; navigable
 *     in both directions; the association owns both ends. Redefines the
 *     equivalent association in MOF Core but with multiplicity [1..*] and
 *     bidirectional navigation.
 * @operations
 *   getMetaClass() : Class
 *   getMetaClasses() : Class [1..*]
 *   reclassify(oldMetaClass : Class [0..*], newMetaClass : Class [0..*]) : void
 *   reclassifyAll(newMetaClass : Class [1..*]) : void
 *   addMetaClass(newMetaClass : Class [1..*]) : void
 *   removeMetaClass(oldMetaClass : Class [1..*]) : void
 *   container() : Element
 *   getContainers() : Element [0..*]
 *   getContainerForMetaClass(metaClass : Class) : Element
 * @constraints
 *   [1] Metaclasses to be added must not be abstract.
 *       not self.getMetaClasses()->exists(isAbstract=true)
 *   [2] Any element must be classified by at least one metaclass.
 *       self.getMetaClasses()->size() >=1
 *   [3] The metaclass association is derived from the getMetaClasses operation.
 *       self.metaClass = self.getMetaClasses()
 */
export interface ISMOFElement<Payload = unknown> extends IReflectionElement<Payload> {
  readonly metaClass: 'SMOFElement'
  /**
   * Derived [1..*] association A_element_metaclass; navigable both ways,
   * association owns both ends. Per constraint [3] this set equals
   * `getMetaClasses()`.
   */
  readonly metaclasses: ReadonlyArray<IClass>
  /**
   * Returns the single classifying metaclass when `getMetaClasses().size() == 1`.
   * Spec semantics: if more than one metaclass classifies this Element, the
   * operation throws an exception. The return type widens to `IClass | string`
   * to match the upstream `IReflectionObject::getMetaClass()` contract — the
   * `string` branch is the metaclass-name discriminator for Elements not yet
   * bound to a UML Class registry entry.
   */
  getMetaClass(): IClass | string
  /** Returns the full set of metaclasses classifying this Element [1..*]. */
  getMetaClasses(): ReadonlyArray<IClass>
  /**
   * Atomic reclassification: removes `oldMetaClass`, adds `newMetaClass`.
   * Throws if `oldMetaClass` contains any class not currently in
   * `getMetaClasses()`. Per the §9.1.2.2 Semantics: shared classes between
   * old and new sets are preserved (their feature values are retained), and
   * any class introduced by both sides is treated as a no-op.
   */
  reclassify(
    oldMetaClass: ReadonlyArray<IClass>,
    newMetaClass: ReadonlyArray<IClass>,
  ): void
  /**
   * Atomic full reclassification: removes every current metaclass and
   * installs `newMetaClass`. Multiplicity [1..*] enforces constraint [2].
   */
  reclassifyAll(newMetaClass: ReadonlyArray<IClass>): void
  /**
   * Convenience: equivalent to `reclassify([], newMetaClass)`. Adds the
   * metaclasses without removing any.
   */
  addMetaClass(newMetaClass: ReadonlyArray<IClass>): void
  /**
   * Convenience: equivalent to `reclassify(oldMetaClass, [])`. Removes the
   * metaclasses without adding any. Subject to constraint [2].
   */
  removeMetaClass(oldMetaClass: ReadonlyArray<IClass>): void
  /**
   * Redefines MOF::Reflection::Element::container(). Returns the parent
   * container of this Element if any, or `undefined`. If more than one
   * container exists (possible under multiple classification), the
   * operation throws an exception in the spec; the TypeScript projection
   * returns `undefined` and documents the throw contract.
   */
  container(): ISMOFElement | undefined
  /** Returns all existing parent containers for this Element. */
  getContainers(): ReadonlyArray<ISMOFElement>
  /**
   * Returns the parent container, if any, defined by classification by
   * `metaClass`. Returns `undefined` if no such container exists.
   */
  getContainerForMetaClass(metaClass: IClass): ISMOFElement | undefined
}

/**
 * @standard OMG SMOF 1.0 §9.1.2.2 Element (as extended)
 * @section §9.1.2.2
 * @metaclass abstract
 *
 * Abstract base. Subclasses implement the §9.1.2.2 operations and maintain
 * the invariants stated in constraints [1] [2] [3].
 */
export abstract class AbstractSMOFElement<Payload = unknown>
  implements ISMOFElement<Payload>
{
  readonly metaClass = 'SMOFElement' as const
  readonly mofVersion: string = '2.5.1'

  protected constructor(
    readonly mofId: string,
    readonly payload: Payload,
  ) {}

  abstract readonly metaclasses: ReadonlyArray<IClass>
  // Inherited from IReflectionElement (§15.4) — must be re-declared abstract
  // so subclasses bind a concrete UML Class (when known) or `undefined`.
  abstract readonly metaclass: IClass | undefined
  abstract isInstanceOfType(type: IClass, includesSubtypes: boolean): boolean
  abstract get(property: IProperty): unknown
  abstract set(property: IProperty, value: unknown): void
  abstract isSet(property: IProperty): boolean
  abstract unset(property: IProperty): void
  abstract equals(other: IReflectionObject): boolean
  abstract invoke(
    op: import('@amlhubs/uml').IOperation,
    args: ReadonlyArray<import('@amlhubs/mof').ICMOFReflectionArgument>,
  ): unknown
  abstract metaClassName(): string
  // Backward-compat names from the upstream MOF protocol surface.
  abstract getProperty(propertyName: string): unknown
  abstract setProperty(propertyName: string, value: unknown): boolean
  abstract isPropertySet(propertyName: string): boolean
  abstract unsetProperty(propertyName: string): boolean
  abstract equalsObject(other: IReflectionObject): boolean
  abstract containerOf(): IReflectionObject | undefined

  abstract getMetaClass(): IClass | string
  abstract getMetaClasses(): ReadonlyArray<IClass>
  abstract reclassify(
    oldMetaClass: ReadonlyArray<IClass>,
    newMetaClass: ReadonlyArray<IClass>,
  ): void
  abstract reclassifyAll(newMetaClass: ReadonlyArray<IClass>): void
  abstract addMetaClass(newMetaClass: ReadonlyArray<IClass>): void
  abstract removeMetaClass(oldMetaClass: ReadonlyArray<IClass>): void
  abstract container(): ISMOFElement | undefined
  abstract getContainers(): ReadonlyArray<ISMOFElement>
  abstract getContainerForMetaClass(metaClass: IClass): ISMOFElement | undefined
}

// ───────────────────────────────────────────────────────────────────────────
// A.3 — Factory (as clarified) (§9.1.2.3)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofFactory — Factory (as clarified)
/**
 * @standard OMG SMOF 1.0 §9.1.2.3 Factory
 * @section §9.1.2.3
 * @metaclass concrete (marker subtype of MOF::Reflection::Factory)
 * @generalization MOF::Reflection::Factory
 * @definition Factory has not changed from CMOF. If an Element with multiple
 *   classifications needs to be constructed, a two-step process must be
 *   applied:
 *     1. Create the Element with single classification using one of the
 *        CMOF Factory operations create() or createElement().
 *     2. Add additional metaclasses using the SMOF
 *        Element::addMetaClass() operation.
 * @operations
 *   (none new — inherits create / createFromString / convertToString from
 *    MOF::Reflection::Factory.)
 * @constraints
 *   (none — Factory carries no SMOF-specific OCL constraints; the two-step
 *    construction is a usage convention, not a metaclass invariant.)
 */
export interface ISMOFFactory extends IReflectionFactory {
  readonly metaClass: 'SMOFFactory'
}

// ───────────────────────────────────────────────────────────────────────────
// A.4 — SEMOF Package marker (§8.1)
// ───────────────────────────────────────────────────────────────────────────

// signature: semofPackage — SEMOF Package marker
/**
 * @standard OMG SMOF 1.0 §8.1 SEMOF Package
 * @section §8.1
 * @metaclass concrete (Package marker)
 * @generalization (none — Package merge target)
 * @definition Package SEMOF contains all MOF 2 Core extensions provided by
 *   SMOF for EMOF compliance. SEMOF is built by merging EMOF via
 *   «packageMerge» and adding the SMOF-specific metaclass extensions
 *   (Constraint as extended, Element as extended, Factory as clarified).
 *   Per §8.1, this also necessitates the inclusion of
 *   Abstractions::Constraints and Abstractions::Expressions into SEMOF
 *   because SMOF involves the declaration of constraints.
 * @ownedAttributes
 *   /mergedPackages : UML::Package [1..*] {derived from «packageMerge»}
 * @operations
 *   (none)
 * @constraints
 *   (none beyond the EMOF-inherited constraints — the SEMOF amendment to
 *    constraint [8] in clause 12.4 of MOF Core 2.4.1 admits Constraint and
 *    OpaqueExpression as concrete metaclasses available in SEMOF.)
 */
export interface ISEMOFPackage {
  readonly metaClass: 'SEMOFPackage'
  /**
   * The packages merged into SEMOF via «packageMerge». Per §8.1 this set
   * contains exactly one element: MOF::EMOF (extended at §9.1.2 with the
   * Constraint, Element, and Factory amendments).
   */
  readonly mergedPackages: ReadonlyArray<IPackage>
}

// ═══════════════════════════════════════════════════════════════════════════
// B. SCMOF PACKAGE (§8.1) — SMOF for CMOF Compliance
// SCMOF does not contain any SMOF-specific extensions; it merges the
// additional features of CMOF (compared to EMOF) into package SEMOF.
// ═══════════════════════════════════════════════════════════════════════════

// signature: scmofPackage — SCMOF Package marker
/**
 * @standard OMG SMOF 1.0 §8.1 SCMOF Package
 * @section §8.1
 * @metaclass concrete (Package marker)
 * @generalization (none — Package merge target)
 * @definition Package SCMOF is the SMOF for CMOF compliance level. Per §8.1
 *   SCMOF does not contain any SMOF-specific extensions; it merges the
 *   additional features of CMOF (compared to EMOF) into package SEMOF.
 *   Per §8.1 the amendment of clause 12.5 of MOF Core 2.4.1 applies to
 *   Property::isComposite==true: an object may have at most one container
 *   (or, if the object is multiply classified, at most one container per
 *   classifier).
 * @ownedAttributes
 *   /mergedPackages : UML::Package [1..*] {derived from «packageMerge»}
 * @operations
 *   (none)
 * @constraints
 *   (none beyond the §8.1 amendments to MOF Core 2.4.1 §12.5, which scope
 *    container uniqueness on a per-classifier basis under multiple
 *    classification.)
 */
export interface ISCMOFPackage {
  readonly metaClass: 'SCMOFPackage'
  /**
   * The packages merged into SCMOF via «packageMerge». Per §8.1 this set
   * contains exactly two elements: MOF::CMOF and SEMOF.
   */
  readonly mergedPackages: ReadonlyArray<IPackage>
}

// ═══════════════════════════════════════════════════════════════════════════
// C. SMOF ABSTRACT DOMAIN MODEL (§10.1)
// The semantic domain model is an extended subset of UML 2.4.1 L1 (CAPO:
// Class, Association, Property, OpaqueExpression and all their superclasses,
// properties, associations, constraints, and operations). Five non-abstract
// extension classes are introduced: Instance, Link, Slot, LinkSlot,
// InstanceValue. The Class metaclass is extended with §10.1.1 operations
// (isDisjointWith, isEquivalentTo, hasDisjointAncestorsWith,
// directlyEquivalentClasses, thisAndAllParents) and the
// NotBothEquivalentAndDisjoint constraint.
// ═══════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────
// C.1 — Class (extended at §10.1.1)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofAbstractClass — Class (extended)
/**
 * @standard OMG SMOF 1.0 §10.1.1 Class
 * @section §10.1.1
 * @metaclass concrete (extension of UML::Class within the SMOF Abstract
 *   Domain Model; the underlying UML::Class is itself non-abstract)
 * @generalization UML::Class (via CAPO «merge»)
 * @definition Class as it appears in the SMOF Abstract Domain Model. The
 *   §10.1.1 extension introduces five operations that recognize disjoint
 *   and equivalent class declarations expressed by SMOF Constraint
 *   extensions (per §9.1.2.1) and one structural constraint asserting that
 *   no class can simultaneously be equivalent to and disjoint from another
 *   class.
 * @ownedAttributes
 *   (inherited from UML::Class — no SMOF-specific ownedAttributes)
 * @operations
 *   isDisjointWith(other : Class) : Boolean
 *   isEquivalentTo(other : Class) : Boolean
 *   hasDisjointAncestorsWith(other : Class) : Boolean
 *   directlyEquivalentClasses() : Class [*]
 *   thisAndAllParents() : Class [*]
 * @constraints
 *   NotBothEquivalentAndDisjoint
 *     No pair of classes exists such that they are both equivalent and
 *     disjoint.
 *
 *     inv: not Class.allInstances()->exists(c | self.isEquivalentTo(c) and
 *     self.isDisjointWith(c) or self.hasDisjointAncestorsWith(c)))
 *
 *   Operation post-conditions (verbatim from §10.1.1):
 *
 *   isDisjointWith(other) :
 *     post: result = Constraint.allInstances()->exists(c |
 *       c.specification.oclIsKindOf(OpaqueExpression)
 *       and c.specification.oclAsType(OpaqueExpression).language->at(0)='SMOF'
 *       and c.specification.oclAsType(OpaqueExpression)._'body'->at(0)='disjoint'
 *       and c.constrainedElement->includes(self)
 *       and c.constrainedElement->includes(other))
 *
 *   isEquivalentTo(other) :
 *     post: result = Constraint.allInstances()->exists(c |
 *       c.specification.oclIsKindOf(OpaqueExpression)
 *       and c.specification.oclAsType(OpaqueExpression).language->at(0)='SMOF'
 *       and c.specification.oclAsType(OpaqueExpression)._'body'->at(0)='equivalent'
 *       and c.constrainedElement->includes(self)
 *       and c.constrainedElement->includes(other))
 *
 *   hasDisjointAncestorsWith(other) :
 *     post: result = self.allParents()->exists(c1 | other.allParents()->exists( c2 |
 *       c1.oclAsType(Class).isDisjointWith(c2.oclAsType(Class))))
 *
 *   directlyEquivalentClasses() :
 *     post: result = Class.allInstances()->select(c | self.isEquivalentTo(c))
 *
 *   thisAndAllParents() :
 *     post: result = self->union(allParents()->collect(oclAsType(Class))->asSet())
 */
export interface ISMOFAbstractClass extends IClass {
  readonly metaClass: 'SMOFAbstractClass'
  /** Per §10.1.1 isDisjointWith — recognizes a §9.1.2.1 'disjoint' Constraint. */
  isDisjointWith(other: IClass): boolean
  /** Per §10.1.1 isEquivalentTo — recognizes a §9.1.2.1 'equivalent' Constraint. */
  isEquivalentTo(other: IClass): boolean
  /** Per §10.1.1 hasDisjointAncestorsWith — disjointness via allParents() crossing. */
  hasDisjointAncestorsWith(other: IClass): boolean
  /** Per §10.1.1 directlyEquivalentClasses — Class.allInstances filtered by isEquivalentTo. */
  directlyEquivalentClasses(): ReadonlyArray<IClass>
  /** Per §10.1.1 thisAndAllParents — self ∪ allParents() (cast to Class). */
  thisAndAllParents(): ReadonlyArray<IClass>
}

/**
 * @standard OMG SMOF 1.0 §10.1.1 Class
 * @section §10.1.1
 *
 * The metamodel surface deliberately does not author a concrete
 * `SMOFAbstractClass` class. UML's `IClass` carries dozens of inherited
 * id-typed reference fields (e.g., `ownedAttributeIds`, `generalIds`,
 * `inheritedMemberIds`), each requiring a domain-runtime registry to
 * dereference. The interface `ISMOFAbstractClass` IS the metamodel-surface
 * contract; downstream consumers materialize concrete instances by
 * extending an UML Class implementation and adding the §10.1.1 operation
 * bodies.
 *
 * Operation post-conditions reproduced verbatim under
 * `ISMOFAbstractClass`'s JSDoc consult `Constraint.allInstances()` and
 * `Class.allInstances()` — global queries the metamodel surface cannot
 * resolve without a domain-runtime registry.
 */

// ───────────────────────────────────────────────────────────────────────────
// C.2 — Instance (§10.1.2)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofAbstractInstance — Instance
/**
 * @standard OMG SMOF 1.0 §10.1.2 Instance
 * @section §10.1.2
 * @metaclass concrete (CAPO Instance extension; abstract base authored
 *   because the spec leaves constraint-checking semantics open)
 * @generalization UML::InstanceSpecification (via CAPO subset)
 * @definition The semantic-domain Instance — a non-abstract class
 *   introduced by §10.1 that, together with Link, Slot, LinkSlot, and
 *   InstanceValue, models the runtime classification graph that the §9.1.2
 *   reflective operations manipulate. Classified by one or more Classes (or
 *   Associations, in the Link case). Holds zero or more Slots whose
 *   defining feature is owned by some classifier.
 * @ownedAttributes
 *   classifier : Class [1..*]   -- plus Association in the Link case
 *   slot       : Slot  [0..*]
 * @operations
 *   reclassify(oldMetaClass, newMetaClass) : void
 *   reclassifyAll(newMetaClass)            : void
 *   getMetaClass()                         : Class
 *   getMetaClasses()                       : Class [1..*]
 *   slotIsCleared(prop : Property)         : Boolean
 *   container()                            : Instance
 *   getContainers()                        : Instance [0..*]
 *   getContainerForMetaClass(mc : Class)   : Instance
 *   metaClassIsRemoved(class : Class)      : Boolean
 *   hasAllEquivalentClasses()              : Boolean
 *   delete()                               : void
 * @constraints
 *   OnlyClassesAndAssociations
 *     The classifiers can only be Classes or Associations.
 *
 *     inv: classifier->forAll(c | c.oclIsKindOf(Class) or c.oclIsKindOf(Association))
 *
 *   LinksClassifiedByAssociations
 *     If the InstanceSpecification is not a Link, none of its classifiers
 *     are associations.
 *
 *     inv: not self.oclIsKindOf(Link) implies classifier->forAll(c |
 *        c.oclIsKindOf(Class))
 *
 *   ClassifiersNotAbstract
 *     All classifiers are non-abstract.
 *
 *     inv: not classifier->exists(isAbstract)
 *
 *   SlotsHaveDefiningProperties
 *     The defining feature of each slot is a structural feature (directly
 *     or inherited) of a classifier of the instance specification.
 *
 *     inv: slot->forAll(s | classifier->exists (c |
 *                     c.allFeatures()->includes (s.definingFeature)))
 *
 *   AtMostOneSlotPerFeature
 *     One structural feature (including the same feature inherited from
 *     multiple classifiers) is the defining feature of at most one slot in
 *     an instance specification.
 *
 *     inv: classifier->forAll(c | (c.allFeatures()->forAll(f |
 *                                slot->select(s | s.definingFeature = f)->size() <= 1)))
 *
 *   NoDisjointClasses
 *     No two metaclasses may be disjoint or have disjoint ancestors.
 *
 *     inv: let classes : Set(Class) = self.getMetaClasses() in
 *     classes->forAll(c1 | not classes->exists(c2 | c1 <> c2 and
 *     (c1.isDisjointWith(c2) or c1.hasDisjointAncestorsWith(c2))))
 *
 *   AtLeastOneClassifier
 *     Each instance is classified at least once.
 *
 *     inv: classifier->notEmpty()
 *
 *   AllEquivalentClasses
 *     If any metaclasses or their ancestors have equivalent classes, then
 *     those equivalent classes are also classifiers, either directly or
 *     indirectly.
 *
 *     inv: self.hasAllEquivalentClasses()
 *
 *   AtMostOneContainerPerClassifier
 *     At most one slot within a slice for the opposite of a composite
 *     property may have a value.
 *
 *     inv: let containerSlots : Set(Slot) = Link.allInstances()->select(link |
 *      link.secondSlot.value->any(true).oclAsType(InstanceValue).instance = self
 *      and
 *      link.secondSlot.definingFeature.oclAsType(Property).isComposite
 *      )->collect(firstSlot)->asSet() in
 *
 *        classifier->forAll(cls |
 *            containerSlots->select(slot |
 *                 cls.allFeatures()->includes(slot.definingFeature))->size() <= 1)
 */
export interface ISMOFAbstractInstance {
  readonly metaClass: 'SMOFAbstractInstance'
  /**
   * Classifying metaclasses [1..*]. Per OnlyClassesAndAssociations, every
   * member is a Class or an Association (Associations only when this
   * Instance is also a Link — see LinksClassifiedByAssociations).
   */
  readonly classifier: ReadonlyArray<IClass>
  /** Slots holding the values of features defined by the classifiers. */
  readonly slot: ReadonlyArray<ISMOFAbstractSlot>
  reclassify(
    oldMetaClass: ReadonlyArray<IClass>,
    newMetaClass: ReadonlyArray<IClass>,
  ): void
  reclassifyAll(newMetaClass: ReadonlyArray<IClass>): void
  /** Single-classifier accessor; throws when |getMetaClasses()| > 1. */
  getMetaClass(): IClass | undefined
  /** Full classifier set [1..*]. */
  getMetaClasses(): ReadonlyArray<IClass>
  /** Per §10.1.2 slotIsCleared — composite slot clearing post-condition. */
  slotIsCleared(prop: IProperty): boolean
  /** Returns the unique parent container, or `undefined` if none. */
  container(): ISMOFAbstractInstance | undefined
  /** Returns every parent container; multiple containers possible under multiple classification. */
  getContainers(): ReadonlyArray<ISMOFAbstractInstance>
  /** Returns the parent container defined by classification by `metaClass`. */
  getContainerForMetaClass(metaClass: IClass): ISMOFAbstractInstance | undefined
  /** Per §10.1.2 metaClassIsRemoved — slot-clearing post when a class is removed. */
  metaClassIsRemoved(cls: IClass): boolean
  /** Per §10.1.2 hasAllEquivalentClasses — equivalence-closure invariant probe. */
  hasAllEquivalentClasses(): boolean
  /** Per §10.1.2 delete — clears every slot in pre-state per the post. */
  delete(): void
}

/**
 * @standard OMG SMOF 1.0 §10.1.2 Instance
 * @section §10.1.2
 * @metaclass abstract (the spec defines Instance as concrete in the Abstract
 *   Domain Model; here the metamodel surface authors it as abstract because
 *   the §10.1.2 operation post-conditions and constraint checking require
 *   a domain runtime that resolves Class.allInstances and Link.allInstances
 *   — the metamodel surface declares the contract; downstream consumers
 *   bind the concrete semantics)
 *
 * Abstract base. Subclasses implement the eleven §10.1.2 operations and
 * maintain the nine §10.1.2 invariants.
 */
export abstract class AbstractSMOFAbstractInstance implements ISMOFAbstractInstance {
  readonly metaClass = 'SMOFAbstractInstance' as const

  abstract readonly classifier: ReadonlyArray<IClass>
  abstract readonly slot: ReadonlyArray<ISMOFAbstractSlot>

  abstract reclassify(
    oldMetaClass: ReadonlyArray<IClass>,
    newMetaClass: ReadonlyArray<IClass>,
  ): void
  abstract reclassifyAll(newMetaClass: ReadonlyArray<IClass>): void
  abstract getMetaClass(): IClass | undefined
  abstract getMetaClasses(): ReadonlyArray<IClass>
  abstract slotIsCleared(prop: IProperty): boolean
  abstract container(): ISMOFAbstractInstance | undefined
  abstract getContainers(): ReadonlyArray<ISMOFAbstractInstance>
  abstract getContainerForMetaClass(metaClass: IClass): ISMOFAbstractInstance | undefined
  abstract metaClassIsRemoved(cls: IClass): boolean
  abstract hasAllEquivalentClasses(): boolean
  abstract delete(): void
}

// ───────────────────────────────────────────────────────────────────────────
// C.3 — Link (§10.1)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofAbstractLink — Link
/**
 * @standard OMG SMOF 1.0 §10.1 SMOF Abstract Domain Model — Link
 * @section §10.1
 * @metaclass concrete (extension class introduced by the SMOF Abstract
 *   Domain Model)
 * @generalization Instance (per §10.1.2 LinksClassifiedByAssociations: a
 *   Link is an Instance whose classifiers may include Associations)
 * @definition An ordered pair of LinkSlot anchors that together represent
 *   one tuple of an Association classifier in the runtime classification
 *   graph. Bound on `firstSlot` and `secondSlot` to the LinkSlot extension
 *   of Slot. Used by §10.1.2 OCL bodies to encode containment, composite
 *   ownership, and reclassification post-conditions.
 * @ownedAttributes
 *   firstSlot  : LinkSlot [1]
 *   secondSlot : LinkSlot [1]
 * @operations
 *   (none — Link inherits Instance's operation surface; no Link-specific
 *    operations are introduced by §10.1.)
 * @constraints
 *   (none new — Link participates in the §10.1.2 constraint set via its
 *    classifier set including an Association.)
 */
export interface ISMOFAbstractLink {
  readonly metaClass: 'SMOFAbstractLink'
  readonly firstSlot: ISMOFAbstractLinkSlot
  readonly secondSlot: ISMOFAbstractLinkSlot
}

/**
 * @standard OMG SMOF 1.0 §10.1 Link
 * @section §10.1
 * @metaclass concrete (stub at the metamodel surface)
 *
 * Stub class authored to be subclassed. The metamodel surface declares
 * `firstSlot` / `secondSlot` as abstract `readonly` so downstream consumers
 * bind them to concrete LinkSlot instances.
 */
export abstract class SMOFAbstractLink implements ISMOFAbstractLink {
  readonly metaClass = 'SMOFAbstractLink' as const
  abstract readonly firstSlot: ISMOFAbstractLinkSlot
  abstract readonly secondSlot: ISMOFAbstractLinkSlot
}

// ───────────────────────────────────────────────────────────────────────────
// C.4 — Slot (§10.1)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofAbstractSlot — Slot
/**
 * @standard OMG SMOF 1.0 §10.1 SMOF Abstract Domain Model — Slot
 * @section §10.1
 * @metaclass concrete (extension class introduced by the SMOF Abstract
 *   Domain Model)
 * @generalization (root within the §10.1 extension surface; semantically
 *   parallels UML::Slot in CAPO)
 * @definition A Slot represents the value of one structural feature
 *   defined on one classifier of an Instance. Slots are bound on
 *   `definingFeature : Property` and hold zero or more InstanceValues.
 *   Per AtMostOneSlotPerFeature (§10.1.2), at most one Slot per
 *   feature per Instance.
 * @ownedAttributes
 *   definingFeature : Property         [1]
 *   value           : InstanceValue    [0..*]
 * @operations
 *   (none — Slot is purely structural.)
 * @constraints
 *   (none Slot-local — invariants involving Slot live on Instance per
 *    §10.1.2: SlotsHaveDefiningProperties and AtMostOneSlotPerFeature.)
 */
export interface ISMOFAbstractSlot {
  readonly metaClass: 'SMOFAbstractSlot' | 'SMOFAbstractLinkSlot'
  readonly definingFeature: IProperty
  readonly value: ReadonlyArray<ISMOFAbstractInstanceValue>
}

/**
 * @standard OMG SMOF 1.0 §10.1 Slot
 * @section §10.1
 * @metaclass concrete (stub at the metamodel surface)
 */
export abstract class SMOFAbstractSlot implements ISMOFAbstractSlot {
  readonly metaClass: 'SMOFAbstractSlot' | 'SMOFAbstractLinkSlot' = 'SMOFAbstractSlot'
  abstract readonly definingFeature: IProperty
  abstract readonly value: ReadonlyArray<ISMOFAbstractInstanceValue>
}

// ───────────────────────────────────────────────────────────────────────────
// C.5 — LinkSlot (§10.1)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofAbstractLinkSlot — LinkSlot
/**
 * @standard OMG SMOF 1.0 §10.1 SMOF Abstract Domain Model — LinkSlot
 * @section §10.1
 * @metaclass concrete (extension class introduced by the SMOF Abstract
 *   Domain Model)
 * @generalization Slot
 * @definition The Slot specialization that anchors one of the two ends of a
 *   Link. Inherits `definingFeature` and `value` from Slot. The §10.1.2
 *   AtMostOneContainerPerClassifier OCL traverses LinkSlot via
 *   `Link.allInstances()->...->collect(firstSlot)->asSet()` to compute
 *   container slots per classifier slice.
 * @ownedAttributes
 *   (inherited from Slot — `definingFeature` and `value`)
 * @operations
 *   (none new)
 * @constraints
 *   (none new — invariants involving LinkSlot live on Instance per §10.1.2.)
 */
export interface ISMOFAbstractLinkSlot extends ISMOFAbstractSlot {
  readonly metaClass: 'SMOFAbstractLinkSlot'
}

/**
 * @standard OMG SMOF 1.0 §10.1 LinkSlot
 * @section §10.1
 * @metaclass concrete (stub at the metamodel surface)
 */
export abstract class SMOFAbstractLinkSlot
  extends SMOFAbstractSlot
  implements ISMOFAbstractLinkSlot
{
  override readonly metaClass = 'SMOFAbstractLinkSlot' as const
}

// ───────────────────────────────────────────────────────────────────────────
// C.6 — InstanceValue (§10.1)
// ───────────────────────────────────────────────────────────────────────────

// signature: smofAbstractInstanceValue — InstanceValue
/**
 * @standard OMG SMOF 1.0 §10.1 SMOF Abstract Domain Model — InstanceValue
 * @section §10.1
 * @metaclass concrete (extension class introduced by the SMOF Abstract
 *   Domain Model)
 * @generalization (root within the §10.1 extension surface; semantically
 *   parallels UML::InstanceValue in CAPO)
 * @definition The carrier of one Instance reference held inside a Slot.
 *   The §10.1.2 OCL bodies traverse InstanceValue via
 *   `slot.value->any(true).oclAsType(InstanceValue).instance` to navigate
 *   from a Slot to the Instance it stores.
 * @ownedAttributes
 *   instance : Instance [1]
 * @operations
 *   (none)
 * @constraints
 *   (none — InstanceValue is purely structural.)
 */
export interface ISMOFAbstractInstanceValue {
  readonly metaClass: 'SMOFAbstractInstanceValue'
  readonly instance: ISMOFAbstractInstance
}

/**
 * @standard OMG SMOF 1.0 §10.1 InstanceValue
 * @section §10.1
 * @metaclass concrete (stub at the metamodel surface)
 */
export abstract class SMOFAbstractInstanceValue implements ISMOFAbstractInstanceValue {
  readonly metaClass = 'SMOFAbstractInstanceValue' as const
  abstract readonly instance: ISMOFAbstractInstance
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTED SURFACE — every interface and class authored above is declared
// `export` at its declaration site. The footer below documents the surface
// for spec-compliance auditing tooling. No re-exports are needed.
//
// Interfaces:
//   ISMOFConstraintExtension       (§9.1.2.1)
//   ISMOFElement                   (§9.1.2.2)
//   ISMOFFactory                   (§9.1.2.3)
//   ISEMOFPackage                  (§8.1)
//   ISCMOFPackage                  (§8.1)
//   ISMOFAbstractClass             (§10.1.1)
//   ISMOFAbstractInstance          (§10.1.2)
//   ISMOFAbstractLink              (§10.1)
//   ISMOFAbstractSlot              (§10.1)
//   ISMOFAbstractLinkSlot          (§10.1)
//   ISMOFAbstractInstanceValue     (§10.1)
//
// Classes:
//   AbstractSMOFElement              (abstract, §9.1.2.2)
//   AbstractSMOFAbstractInstance     (abstract, §10.1.2)
//   SMOFAbstractLink                 (concrete stub, §10.1)
//   SMOFAbstractSlot                 (concrete stub, §10.1)
//   SMOFAbstractLinkSlot             (concrete stub, §10.1)
//   SMOFAbstractInstanceValue        (concrete stub, §10.1)
//
// Note: ISMOFConstraintExtension and ISMOFAbstractClass are interface-only at
// the metamodel surface — their UML id-typed references require a domain-
// runtime registry that downstream consumers materialize, not the surface.
// ═══════════════════════════════════════════════════════════════════════════

# Dairy Cow Ration Tutor v4

A GitHub Pages-ready guided teaching app based on the supplied dairy-cow ration example.

## Source exercise

- 550 kg dairy cow
- 25 L milk/day
- 4.5% milk fat
- 3.4% milk protein
- Grass silage: 25% DM, 11 MJ ME/kg DM, 12% CP, q = 0.5
- Dairy concentrate: 90% DM, 13 MJ ME/kg DM, 18% CP, q = 0.7
- Anticipated intake: 16 kg DM/day

The source's worked solution chooses a 16% CP target, balances the diet at approximately 33% silage and 67% concentrate on a DM basis, estimates q at approximately 0.65 for table interpolation, and derives a ration of about 23.2 kg fresh silage plus 11.1 kg fresh concentrate per cow per day.

## Teaching sequence

The student cannot simply press a button to obtain the ration.

1. Identify the first calculation.
2. Select 16% CP and balance silage/concentrate.
3. Calculate weighted ration q.
4. Use the maintenance table.
5. Use the lactation table for 4.5% fat and 3.4% protein.
6. Calculate total ME.
7. Divide total ME between silage and concentrate.
8. Convert each ME contribution to kg DM.
9. Check total DMI against 16 kg/day.
10. Convert DM to fresh/as-fed feed amounts.
11. Apply a practical dairy-feeding check before accepting the mathematical ration.

All calculation fields give immediate feedback as the student types.

## Rounding note

The supplied handwritten worked solution uses rounded values:

- 33% silage / 67% concentrate
- q approximately 0.65
- 59.5 MJ/day maintenance
- 5.35 MJ/L for milk
- about 134 MJ/day milk energy
- about 193.5 MJ/day total ME
- about 64 MJ silage and 130 MJ concentrate
- about 5.8 kg silage DM and 10 kg concentrate DM
- 23.2 kg fresh silage and 11.1 kg fresh concentrate

The app accepts small rounding differences around those worked values.


## Practical feeding rules retained in the app

After the arithmetic is completed, the student must apply the practical rules supplied for the exercise:

- High-energy dairy concentrate should contain about **14–18% CP**.
- With average-to-poor grass silage, a **16–18% CP** concentrate is appropriate.
- The concentrate should include a balanced mineral/vitamin premix.
- For the early-lactation teaching example, about **4–8 kg concentrate/cow/day** is used as the practical range, with **7–8 kg/day** treated as an upper benchmark.
- Mid-to-late lactation concentrate allowance should normally fall as milk output declines and forage supplies more of the requirement.

This creates an important teaching distinction:

> A ration may be mathematically balanced for energy and protein but still be unsuitable as a practical feeding recommendation.

In the supplied worked example, the arithmetic produces about **11.1 kg fresh concentrate/cow/day**. The app therefore flags that amount as above the practical teaching benchmark even though the concentrate's **18% CP** concentration is appropriate.

The app also tells students that they must **not simply cap concentrate at 8 kg/day** without reformulating the whole diet, because doing so changes both the energy and protein supply.

The source exercise does not provide the concentrate's mineral declaration, so mineral and vitamin adequacy cannot be verified from the given data.


## Optional high-quality grazed ryegrass scenario

A second forage option has been added for comparison:

- High-quality grazed leafy ryegrass
- **11.5 MJ ME/kg DM**
- **15–20% DM**
- **15–20% CP**
- **35–40% NDF**
- **q = 0.75**

Because DM and CP were supplied as ranges rather than single values, the app lets the student choose the exact values within those ranges.

After the original worked exercise is completed, students can test a practical fresh-concentrate allowance between **4 and 8 kg/cow/day**. The app then calculates:

```text
concentrate DM = fresh concentrate × 0.90
concentrate ME = concentrate DM × 13
remaining ME = 193.5 - concentrate ME
grass DM required = remaining ME / 11.5
fresh grass required = grass DM / selected grass DM fraction
```

It then checks:

- total DMI against the **16 kg/day** anticipated intake;
- final diet CP against the **16%** target.

The leafy ryegrass option now uses the teacher-supplied **35–40% NDF** range and **q = 0.75**.

Because the original exercise tables stop at q = 0.7, the app estimates the q = 0.75 maintenance and lactation requirements by **simple linear extrapolation** from the q = 0.6 and q = 0.7 table values. This is clearly labelled in the app.

The dairy concentrate NDF value is still not supplied, so the app reports **NDF contributed by the grass** but does not claim a complete mixed-diet NDF percentage.

With the default comparison values of **18% grass DM, 17.5% grass CP, 37.5% grass NDF and 8 kg fresh concentrate/day**, the good-forage option recalculates the cow's energy requirement at q = 0.75, then checks energy, total DMI and CP.

## GitHub Pages

Upload these files to the root of a GitHub repository:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

Then enable:

**Settings -> Pages -> Deploy from a branch -> main -> /(root)**

No server or build process is required.

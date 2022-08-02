import pandas as pd
import mwclient
from mwclient import Site
import regex
import sys


def main():
    df = pd.read_csv(
        "genome_Jeffrey_Peck_v5_Full_20220731184907.txt",
        sep="\t",
        comment="#",
        header=None,
        names=["rsid", "chromosome", "position", "genotype"],
        dtype="string",
    )

    site = mwclient.Site(scheme="https", host="bots.snpedia.com", path="/")

    print("\t".join(["Name", "Your Genotype", "Matched", "Repute", "Summary", "URL"]))

    for i, page in enumerate(site.Categories["Is a genotype"]):
        m = regex.match(r"([^(]*)\((.+)\)", page.name)

        if not m:
            print(f"Could not match on {page.name}", file=sys.stderr)
            continue

        rsid = m[1]
        alleles = m[2].split(";")

        entry = df[df["rsid"] == rsid.lower()]

        matched = True
        if entry.empty:
            matched = False

        genotype = entry.genotype.to_string(index=False)

        if len(genotype) == 1:
            genotype = genotype * 2

        if "".join(alleles) != genotype:
            matched = False

        repute = ""
        summary = ""
        for line in page.text().split("\n"):
            if "repute" in line:
                repute = line[8:]
            if "summary" in line:
                summary = line[9:]

        print(
            "\t".join(
                [
                    page.name,
                    entry.genotype.to_string(index=False) if not entry.empty else "",
                    str(matched),
                    repute,
                    summary,
                    f"https://www.snpedia.com/index.php/{rsid}",
                ]
            )
        )


if __name__ == "__main__":
    main()
